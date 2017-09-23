/*! Hammer.JS - v2.0.6 - 2016-01-06
 * http://hammerjs.github.io/
 *
 * Copyright (c) 2016 Jorik Tangelder;
 * Licensed under the  license */
!function(a,b,c,d){"use strict";function e(a,b,c){return setTimeout(j(a,c),b)}function f(a,b,c){return Array.isArray(a)?(g(a,c[b],c),!0):!1}function g(a,b,c){var e;if(a)if(a.forEach)a.forEach(b,c);else if(a.length!==d)for(e=0;e<a.length;)b.call(c,a[e],e,a),e++;else for(e in a)a.hasOwnProperty(e)&&b.call(c,a[e],e,a)}function h(b,c,d){var e="DEPRECATED METHOD: "+c+"\n"+d+" AT \n";return function(){var c=new Error("get-stack-trace"),d=c&&c.stack?c.stack.replace(/^[^\(]+?[\n$]/gm,"").replace(/^\s+at\s+/gm,"").replace(/^Object.<anonymous>\s*\(/gm,"{anonymous}()@"):"Unknown Stack Trace",f=a.console&&(a.console.warn||a.console.log);return f&&f.call(a.console,e,d),b.apply(this,arguments)}}function i(a,b,c){var d,e=b.prototype;d=a.prototype=Object.create(e),d.constructor=a,d._super=e,c&&ha(d,c)}function j(a,b){return function(){return a.apply(b,arguments)}}function k(a,b){return typeof a==ka?a.apply(b?b[0]||d:d,b):a}function l(a,b){return a===d?b:a}function m(a,b,c){g(q(b),function(b){a.addEventListener(b,c,!1)})}function n(a,b,c){g(q(b),function(b){a.removeEventListener(b,c,!1)})}function o(a,b){for(;a;){if(a==b)return!0;a=a.parentNode}return!1}function p(a,b){return a.indexOf(b)>-1}function q(a){return a.trim().split(/\s+/g)}function r(a,b,c){if(a.indexOf&&!c)return a.indexOf(b);for(var d=0;d<a.length;){if(c&&a[d][c]==b||!c&&a[d]===b)return d;d++}return-1}function s(a){return Array.prototype.slice.call(a,0)}function t(a,b,c){for(var d=[],e=[],f=0;f<a.length;){var g=b?a[f][b]:a[f];r(e,g)<0&&d.push(a[f]),e[f]=g,f++}return c&&(d=b?d.sort(function(a,c){return a[b]>c[b]}):d.sort()),d}function u(a,b){for(var c,e,f=b[0].toUpperCase()+b.slice(1),g=0;g<ia.length;){if(c=ia[g],e=c?c+f:b,e in a)return e;g++}return d}function v(){return qa++}function w(b){var c=b.ownerDocument||b;return c.defaultView||c.parentWindow||a}function x(a,b){var c=this;this.manager=a,this.callback=b,this.element=a.element,this.target=a.options.inputTarget,this.domHandler=function(b){k(a.options.enable,[a])&&c.handler(b)},this.init()}function y(a){var b,c=a.options.inputClass;return new(b=c?c:ta?M:ua?P:sa?R:L)(a,z)}function z(a,b,c){var d=c.pointers.length,e=c.changedPointers.length,f=b&Aa&&d-e===0,g=b&(Ca|Da)&&d-e===0;c.isFirst=!!f,c.isFinal=!!g,f&&(a.session={}),c.eventType=b,A(a,c),a.emit("hammer.input",c),a.recognize(c),a.session.prevInput=c}function A(a,b){var c=a.session,d=b.pointers,e=d.length;c.firstInput||(c.firstInput=D(b)),e>1&&!c.firstMultiple?c.firstMultiple=D(b):1===e&&(c.firstMultiple=!1);var f=c.firstInput,g=c.firstMultiple,h=g?g.center:f.center,i=b.center=E(d);b.timeStamp=na(),b.deltaTime=b.timeStamp-f.timeStamp,b.angle=I(h,i),b.distance=H(h,i),B(c,b),b.offsetDirection=G(b.deltaX,b.deltaY);var j=F(b.deltaTime,b.deltaX,b.deltaY);b.overallVelocityX=j.x,b.overallVelocityY=j.y,b.overallVelocity=ma(j.x)>ma(j.y)?j.x:j.y,b.scale=g?K(g.pointers,d):1,b.rotation=g?J(g.pointers,d):0,b.maxPointers=c.prevInput?b.pointers.length>c.prevInput.maxPointers?b.pointers.length:c.prevInput.maxPointers:b.pointers.length,C(c,b);var k=a.element;o(b.srcEvent.target,k)&&(k=b.srcEvent.target),b.target=k}function B(a,b){var c=b.center,d=a.offsetDelta||{},e=a.prevDelta||{},f=a.prevInput||{};(b.eventType===Aa||f.eventType===Ca)&&(e=a.prevDelta={x:f.deltaX||0,y:f.deltaY||0},d=a.offsetDelta={x:c.x,y:c.y}),b.deltaX=e.x+(c.x-d.x),b.deltaY=e.y+(c.y-d.y)}function C(a,b){var c,e,f,g,h=a.lastInterval||b,i=b.timeStamp-h.timeStamp;if(b.eventType!=Da&&(i>za||h.velocity===d)){var j=b.deltaX-h.deltaX,k=b.deltaY-h.deltaY,l=F(i,j,k);e=l.x,f=l.y,c=ma(l.x)>ma(l.y)?l.x:l.y,g=G(j,k),a.lastInterval=b}else c=h.velocity,e=h.velocityX,f=h.velocityY,g=h.direction;b.velocity=c,b.velocityX=e,b.velocityY=f,b.direction=g}function D(a){for(var b=[],c=0;c<a.pointers.length;)b[c]={clientX:la(a.pointers[c].clientX),clientY:la(a.pointers[c].clientY)},c++;return{timeStamp:na(),pointers:b,center:E(b),deltaX:a.deltaX,deltaY:a.deltaY}}function E(a){var b=a.length;if(1===b)return{x:la(a[0].clientX),y:la(a[0].clientY)};for(var c=0,d=0,e=0;b>e;)c+=a[e].clientX,d+=a[e].clientY,e++;return{x:la(c/b),y:la(d/b)}}function F(a,b,c){return{x:b/a||0,y:c/a||0}}function G(a,b){return a===b?Ea:ma(a)>=ma(b)?0>a?Fa:Ga:0>b?Ha:Ia}function H(a,b,c){c||(c=Ma);var d=b[c[0]]-a[c[0]],e=b[c[1]]-a[c[1]];return Math.sqrt(d*d+e*e)}function I(a,b,c){c||(c=Ma);var d=b[c[0]]-a[c[0]],e=b[c[1]]-a[c[1]];return 180*Math.atan2(e,d)/Math.PI}function J(a,b){return I(b[1],b[0],Na)+I(a[1],a[0],Na)}function K(a,b){return H(b[0],b[1],Na)/H(a[0],a[1],Na)}function L(){this.evEl=Pa,this.evWin=Qa,this.allow=!0,this.pressed=!1,x.apply(this,arguments)}function M(){this.evEl=Ta,this.evWin=Ua,x.apply(this,arguments),this.store=this.manager.session.pointerEvents=[]}function N(){this.evTarget=Wa,this.evWin=Xa,this.started=!1,x.apply(this,arguments)}function O(a,b){var c=s(a.touches),d=s(a.changedTouches);return b&(Ca|Da)&&(c=t(c.concat(d),"identifier",!0)),[c,d]}function P(){this.evTarget=Za,this.targetIds={},x.apply(this,arguments)}function Q(a,b){var c=s(a.touches),d=this.targetIds;if(b&(Aa|Ba)&&1===c.length)return d[c[0].identifier]=!0,[c,c];var e,f,g=s(a.changedTouches),h=[],i=this.target;if(f=c.filter(function(a){return o(a.target,i)}),b===Aa)for(e=0;e<f.length;)d[f[e].identifier]=!0,e++;for(e=0;e<g.length;)d[g[e].identifier]&&h.push(g[e]),b&(Ca|Da)&&delete d[g[e].identifier],e++;return h.length?[t(f.concat(h),"identifier",!0),h]:void 0}function R(){x.apply(this,arguments);var a=j(this.handler,this);this.touch=new P(this.manager,a),this.mouse=new L(this.manager,a)}function S(a,b){this.manager=a,this.set(b)}function T(a){if(p(a,db))return db;var b=p(a,eb),c=p(a,fb);return b&&c?db:b||c?b?eb:fb:p(a,cb)?cb:bb}function U(a){this.options=ha({},this.defaults,a||{}),this.id=v(),this.manager=null,this.options.enable=l(this.options.enable,!0),this.state=gb,this.simultaneous={},this.requireFail=[]}function V(a){return a&lb?"cancel":a&jb?"end":a&ib?"move":a&hb?"start":""}function W(a){return a==Ia?"down":a==Ha?"up":a==Fa?"left":a==Ga?"right":""}function X(a,b){var c=b.manager;return c?c.get(a):a}function Y(){U.apply(this,arguments)}function Z(){Y.apply(this,arguments),this.pX=null,this.pY=null}function $(){Y.apply(this,arguments)}function _(){U.apply(this,arguments),this._timer=null,this._input=null}function aa(){Y.apply(this,arguments)}function ba(){Y.apply(this,arguments)}function ca(){U.apply(this,arguments),this.pTime=!1,this.pCenter=!1,this._timer=null,this._input=null,this.count=0}function da(a,b){return b=b||{},b.recognizers=l(b.recognizers,da.defaults.preset),new ea(a,b)}function ea(a,b){this.options=ha({},da.defaults,b||{}),this.options.inputTarget=this.options.inputTarget||a,this.handlers={},this.session={},this.recognizers=[],this.element=a,this.input=y(this),this.touchAction=new S(this,this.options.touchAction),fa(this,!0),g(this.options.recognizers,function(a){var b=this.add(new a[0](a[1]));a[2]&&b.recognizeWith(a[2]),a[3]&&b.requireFailure(a[3])},this)}function fa(a,b){var c=a.element;c.style&&g(a.options.cssProps,function(a,d){c.style[u(c.style,d)]=b?a:""})}function ga(a,c){var d=b.createEvent("Event");d.initEvent(a,!0,!0),d.gesture=c,c.target.dispatchEvent(d)}var ha,ia=["","webkit","Moz","MS","ms","o"],ja=b.createElement("div"),ka="function",la=Math.round,ma=Math.abs,na=Date.now;ha="function"!=typeof Object.assign?function(a){if(a===d||null===a)throw new TypeError("Cannot convert undefined or null to object");for(var b=Object(a),c=1;c<arguments.length;c++){var e=arguments[c];if(e!==d&&null!==e)for(var f in e)e.hasOwnProperty(f)&&(b[f]=e[f])}return b}:Object.assign;var oa=h(function(a,b,c){for(var e=Object.keys(b),f=0;f<e.length;)(!c||c&&a[e[f]]===d)&&(a[e[f]]=b[e[f]]),f++;return a},"extend","Use `assign`."),pa=h(function(a,b){return oa(a,b,!0)},"merge","Use `assign`."),qa=1,ra=/mobile|tablet|ip(ad|hone|od)|android/i,sa="ontouchstart"in a,ta=u(a,"PointerEvent")!==d,ua=sa&&ra.test(navigator.userAgent),va="touch",wa="pen",xa="mouse",ya="kinect",za=25,Aa=1,Ba=2,Ca=4,Da=8,Ea=1,Fa=2,Ga=4,Ha=8,Ia=16,Ja=Fa|Ga,Ka=Ha|Ia,La=Ja|Ka,Ma=["x","y"],Na=["clientX","clientY"];x.prototype={handler:function(){},init:function(){this.evEl&&m(this.element,this.evEl,this.domHandler),this.evTarget&&m(this.target,this.evTarget,this.domHandler),this.evWin&&m(w(this.element),this.evWin,this.domHandler)},destroy:function(){this.evEl&&n(this.element,this.evEl,this.domHandler),this.evTarget&&n(this.target,this.evTarget,this.domHandler),this.evWin&&n(w(this.element),this.evWin,this.domHandler)}};var Oa={mousedown:Aa,mousemove:Ba,mouseup:Ca},Pa="mousedown",Qa="mousemove mouseup";i(L,x,{handler:function(a){var b=Oa[a.type];b&Aa&&0===a.button&&(this.pressed=!0),b&Ba&&1!==a.which&&(b=Ca),this.pressed&&this.allow&&(b&Ca&&(this.pressed=!1),this.callback(this.manager,b,{pointers:[a],changedPointers:[a],pointerType:xa,srcEvent:a}))}});var Ra={pointerdown:Aa,pointermove:Ba,pointerup:Ca,pointercancel:Da,pointerout:Da},Sa={2:va,3:wa,4:xa,5:ya},Ta="pointerdown",Ua="pointermove pointerup pointercancel";a.MSPointerEvent&&!a.PointerEvent&&(Ta="MSPointerDown",Ua="MSPointerMove MSPointerUp MSPointerCancel"),i(M,x,{handler:function(a){var b=this.store,c=!1,d=a.type.toLowerCase().replace("ms",""),e=Ra[d],f=Sa[a.pointerType]||a.pointerType,g=f==va,h=r(b,a.pointerId,"pointerId");e&Aa&&(0===a.button||g)?0>h&&(b.push(a),h=b.length-1):e&(Ca|Da)&&(c=!0),0>h||(b[h]=a,this.callback(this.manager,e,{pointers:b,changedPointers:[a],pointerType:f,srcEvent:a}),c&&b.splice(h,1))}});var Va={touchstart:Aa,touchmove:Ba,touchend:Ca,touchcancel:Da},Wa="touchstart",Xa="touchstart touchmove touchend touchcancel";i(N,x,{handler:function(a){var b=Va[a.type];if(b===Aa&&(this.started=!0),this.started){var c=O.call(this,a,b);b&(Ca|Da)&&c[0].length-c[1].length===0&&(this.started=!1),this.callback(this.manager,b,{pointers:c[0],changedPointers:c[1],pointerType:va,srcEvent:a})}}});var Ya={touchstart:Aa,touchmove:Ba,touchend:Ca,touchcancel:Da},Za="touchstart touchmove touchend touchcancel";i(P,x,{handler:function(a){var b=Ya[a.type],c=Q.call(this,a,b);c&&this.callback(this.manager,b,{pointers:c[0],changedPointers:c[1],pointerType:va,srcEvent:a})}}),i(R,x,{handler:function(a,b,c){var d=c.pointerType==va,e=c.pointerType==xa;if(d)this.mouse.allow=!1;else if(e&&!this.mouse.allow)return;b&(Ca|Da)&&(this.mouse.allow=!0),this.callback(a,b,c)},destroy:function(){this.touch.destroy(),this.mouse.destroy()}});var $a=u(ja.style,"touchAction"),_a=$a!==d,ab="compute",bb="auto",cb="manipulation",db="none",eb="pan-x",fb="pan-y";S.prototype={set:function(a){a==ab&&(a=this.compute()),_a&&this.manager.element.style&&(this.manager.element.style[$a]=a),this.actions=a.toLowerCase().trim()},update:function(){this.set(this.manager.options.touchAction)},compute:function(){var a=[];return g(this.manager.recognizers,function(b){k(b.options.enable,[b])&&(a=a.concat(b.getTouchAction()))}),T(a.join(" "))},preventDefaults:function(a){if(!_a){var b=a.srcEvent,c=a.offsetDirection;if(this.manager.session.prevented)return void b.preventDefault();var d=this.actions,e=p(d,db),f=p(d,fb),g=p(d,eb);if(e){var h=1===a.pointers.length,i=a.distance<2,j=a.deltaTime<250;if(h&&i&&j)return}if(!g||!f)return e||f&&c&Ja||g&&c&Ka?this.preventSrc(b):void 0}},preventSrc:function(a){this.manager.session.prevented=!0,a.preventDefault()}};var gb=1,hb=2,ib=4,jb=8,kb=jb,lb=16,mb=32;U.prototype={defaults:{},set:function(a){return ha(this.options,a),this.manager&&this.manager.touchAction.update(),this},recognizeWith:function(a){if(f(a,"recognizeWith",this))return this;var b=this.simultaneous;return a=X(a,this),b[a.id]||(b[a.id]=a,a.recognizeWith(this)),this},dropRecognizeWith:function(a){return f(a,"dropRecognizeWith",this)?this:(a=X(a,this),delete this.simultaneous[a.id],this)},requireFailure:function(a){if(f(a,"requireFailure",this))return this;var b=this.requireFail;return a=X(a,this),-1===r(b,a)&&(b.push(a),a.requireFailure(this)),this},dropRequireFailure:function(a){if(f(a,"dropRequireFailure",this))return this;a=X(a,this);var b=r(this.requireFail,a);return b>-1&&this.requireFail.splice(b,1),this},hasRequireFailures:function(){return this.requireFail.length>0},canRecognizeWith:function(a){return!!this.simultaneous[a.id]},emit:function(a){function b(b){c.manager.emit(b,a)}var c=this,d=this.state;jb>d&&b(c.options.event+V(d)),b(c.options.event),a.additionalEvent&&b(a.additionalEvent),d>=jb&&b(c.options.event+V(d))},tryEmit:function(a){return this.canEmit()?this.emit(a):void(this.state=mb)},canEmit:function(){for(var a=0;a<this.requireFail.length;){if(!(this.requireFail[a].state&(mb|gb)))return!1;a++}return!0},recognize:function(a){var b=ha({},a);return k(this.options.enable,[this,b])?(this.state&(kb|lb|mb)&&(this.state=gb),this.state=this.process(b),void(this.state&(hb|ib|jb|lb)&&this.tryEmit(b))):(this.reset(),void(this.state=mb))},process:function(a){},getTouchAction:function(){},reset:function(){}},i(Y,U,{defaults:{pointers:1},attrTest:function(a){var b=this.options.pointers;return 0===b||a.pointers.length===b},process:function(a){var b=this.state,c=a.eventType,d=b&(hb|ib),e=this.attrTest(a);return d&&(c&Da||!e)?b|lb:d||e?c&Ca?b|jb:b&hb?b|ib:hb:mb}}),i(Z,Y,{defaults:{event:"pan",threshold:10,pointers:1,direction:La},getTouchAction:function(){var a=this.options.direction,b=[];return a&Ja&&b.push(fb),a&Ka&&b.push(eb),b},directionTest:function(a){var b=this.options,c=!0,d=a.distance,e=a.direction,f=a.deltaX,g=a.deltaY;return e&b.direction||(b.direction&Ja?(e=0===f?Ea:0>f?Fa:Ga,c=f!=this.pX,d=Math.abs(a.deltaX)):(e=0===g?Ea:0>g?Ha:Ia,c=g!=this.pY,d=Math.abs(a.deltaY))),a.direction=e,c&&d>b.threshold&&e&b.direction},attrTest:function(a){return Y.prototype.attrTest.call(this,a)&&(this.state&hb||!(this.state&hb)&&this.directionTest(a))},emit:function(a){this.pX=a.deltaX,this.pY=a.deltaY;var b=W(a.direction);b&&(a.additionalEvent=this.options.event+b),this._super.emit.call(this,a)}}),i($,Y,{defaults:{event:"pinch",threshold:0,pointers:2},getTouchAction:function(){return[db]},attrTest:function(a){return this._super.attrTest.call(this,a)&&(Math.abs(a.scale-1)>this.options.threshold||this.state&hb)},emit:function(a){if(1!==a.scale){var b=a.scale<1?"in":"out";a.additionalEvent=this.options.event+b}this._super.emit.call(this,a)}}),i(_,U,{defaults:{event:"press",pointers:1,time:251,threshold:9},getTouchAction:function(){return[bb]},process:function(a){var b=this.options,c=a.pointers.length===b.pointers,d=a.distance<b.threshold,f=a.deltaTime>b.time;if(this._input=a,!d||!c||a.eventType&(Ca|Da)&&!f)this.reset();else if(a.eventType&Aa)this.reset(),this._timer=e(function(){this.state=kb,this.tryEmit()},b.time,this);else if(a.eventType&Ca)return kb;return mb},reset:function(){clearTimeout(this._timer)},emit:function(a){this.state===kb&&(a&&a.eventType&Ca?this.manager.emit(this.options.event+"up",a):(this._input.timeStamp=na(),this.manager.emit(this.options.event,this._input)))}}),i(aa,Y,{defaults:{event:"rotate",threshold:0,pointers:2},getTouchAction:function(){return[db]},attrTest:function(a){return this._super.attrTest.call(this,a)&&(Math.abs(a.rotation)>this.options.threshold||this.state&hb)}}),i(ba,Y,{defaults:{event:"swipe",threshold:10,velocity:.3,direction:Ja|Ka,pointers:1},getTouchAction:function(){return Z.prototype.getTouchAction.call(this)},attrTest:function(a){var b,c=this.options.direction;return c&(Ja|Ka)?b=a.overallVelocity:c&Ja?b=a.overallVelocityX:c&Ka&&(b=a.overallVelocityY),this._super.attrTest.call(this,a)&&c&a.offsetDirection&&a.distance>this.options.threshold&&a.maxPointers==this.options.pointers&&ma(b)>this.options.velocity&&a.eventType&Ca},emit:function(a){var b=W(a.offsetDirection);b&&this.manager.emit(this.options.event+b,a),this.manager.emit(this.options.event,a)}}),i(ca,U,{defaults:{event:"tap",pointers:1,taps:1,interval:300,time:250,threshold:9,posThreshold:10},getTouchAction:function(){return[cb]},process:function(a){var b=this.options,c=a.pointers.length===b.pointers,d=a.distance<b.threshold,f=a.deltaTime<b.time;if(this.reset(),a.eventType&Aa&&0===this.count)return this.failTimeout();if(d&&f&&c){if(a.eventType!=Ca)return this.failTimeout();var g=this.pTime?a.timeStamp-this.pTime<b.interval:!0,h=!this.pCenter||H(this.pCenter,a.center)<b.posThreshold;this.pTime=a.timeStamp,this.pCenter=a.center,h&&g?this.count+=1:this.count=1,this._input=a;var i=this.count%b.taps;if(0===i)return this.hasRequireFailures()?(this._timer=e(function(){this.state=kb,this.tryEmit()},b.interval,this),hb):kb}return mb},failTimeout:function(){return this._timer=e(function(){this.state=mb},this.options.interval,this),mb},reset:function(){clearTimeout(this._timer)},emit:function(){this.state==kb&&(this._input.tapCount=this.count,this.manager.emit(this.options.event,this._input))}}),da.VERSION="2.0.6",da.defaults={domEvents:!1,touchAction:ab,enable:!0,inputTarget:null,inputClass:null,preset:[[aa,{enable:!1}],[$,{enable:!1},["rotate"]],[ba,{direction:Ja}],[Z,{direction:Ja},["swipe"]],[ca],[ca,{event:"doubletap",taps:2},["tap"]],[_]],cssProps:{userSelect:"none",touchSelect:"none",touchCallout:"none",contentZooming:"none",userDrag:"none",tapHighlightColor:"rgba(0,0,0,0)"}};var nb=1,ob=2;ea.prototype={set:function(a){return ha(this.options,a),a.touchAction&&this.touchAction.update(),a.inputTarget&&(this.input.destroy(),this.input.target=a.inputTarget,this.input.init()),this},stop:function(a){this.session.stopped=a?ob:nb},recognize:function(a){var b=this.session;if(!b.stopped){this.touchAction.preventDefaults(a);var c,d=this.recognizers,e=b.curRecognizer;(!e||e&&e.state&kb)&&(e=b.curRecognizer=null);for(var f=0;f<d.length;)c=d[f],b.stopped===ob||e&&c!=e&&!c.canRecognizeWith(e)?c.reset():c.recognize(a),!e&&c.state&(hb|ib|jb)&&(e=b.curRecognizer=c),f++}},get:function(a){if(a instanceof U)return a;for(var b=this.recognizers,c=0;c<b.length;c++)if(b[c].options.event==a)return b[c];return null},add:function(a){if(f(a,"add",this))return this;var b=this.get(a.options.event);return b&&this.remove(b),this.recognizers.push(a),a.manager=this,this.touchAction.update(),a},remove:function(a){if(f(a,"remove",this))return this;if(a=this.get(a)){var b=this.recognizers,c=r(b,a);-1!==c&&(b.splice(c,1),this.touchAction.update())}return this},on:function(a,b){var c=this.handlers;return g(q(a),function(a){c[a]=c[a]||[],c[a].push(b)}),this},off:function(a,b){var c=this.handlers;return g(q(a),function(a){b?c[a]&&c[a].splice(r(c[a],b),1):delete c[a]}),this},emit:function(a,b){this.options.domEvents&&ga(a,b);var c=this.handlers[a]&&this.handlers[a].slice();if(c&&c.length){b.type=a,b.preventDefault=function(){b.srcEvent.preventDefault()};for(var d=0;d<c.length;)c[d](b),d++}},destroy:function(){this.element&&fa(this,!1),this.handlers={},this.session={},this.input.destroy(),this.element=null}},ha(da,{INPUT_START:Aa,INPUT_MOVE:Ba,INPUT_END:Ca,INPUT_CANCEL:Da,STATE_POSSIBLE:gb,STATE_BEGAN:hb,STATE_CHANGED:ib,STATE_ENDED:jb,STATE_RECOGNIZED:kb,STATE_CANCELLED:lb,STATE_FAILED:mb,DIRECTION_NONE:Ea,DIRECTION_LEFT:Fa,DIRECTION_RIGHT:Ga,DIRECTION_UP:Ha,DIRECTION_DOWN:Ia,DIRECTION_HORIZONTAL:Ja,DIRECTION_VERTICAL:Ka,DIRECTION_ALL:La,Manager:ea,Input:x,TouchAction:S,TouchInput:P,MouseInput:L,PointerEventInput:M,TouchMouseInput:R,SingleTouchInput:N,Recognizer:U,AttrRecognizer:Y,Tap:ca,Pan:Z,Swipe:ba,Pinch:$,Rotate:aa,Press:_,on:m,off:n,each:g,merge:pa,extend:oa,assign:ha,inherit:i,bindFn:j,prefixed:u});var pb="undefined"!=typeof a?a:"undefined"!=typeof self?self:{};pb.Hammer=da,"function"==typeof define&&define.amd?define(function(){return da}):"undefined"!=typeof module&&module.exports?module.exports=da:a[c]=da}(window,document,"Hammer");

// Save As
var saveAs=saveAs||function(e){"use strict";if("undefined"==typeof navigator||!/MSIE [1-9]\./.test(navigator.userAgent)){var t=e.document,n=function(){return e.URL||e.webkitURL||e},o=t.createElementNS("http://www.w3.org/1999/xhtml","a"),r="download"in o,i=function(n){var o=t.createEvent("MouseEvents");o.initMouseEvent("click",!0,!1,e,0,0,0,0,0,!1,!1,!1,!1,0,null),n.dispatchEvent(o)},a=e.webkitRequestFileSystem,c=e.requestFileSystem||a||e.mozRequestFileSystem,u=function(t){(e.setImmediate||e.setTimeout)(function(){throw t},0)},f="application/octet-stream",s=0,d=500,l=function(t){var o=function(){"string"==typeof t?n().revokeObjectURL(t):t.remove()};e.chrome?o():setTimeout(o,d)},v=function(e,t,n){t=[].concat(t);for(var o=t.length;o--;){var r=e["on"+t[o]];if("function"==typeof r)try{r.call(e,n||e)}catch(i){u(i)}}},p=function(e){return/^\s*(?:text\/\S*|application\/xml|\S*\/\S*\+xml)\s*;.*charset\s*=\s*utf-8/i.test(e.type)?new Blob(["\ufeff",e],{type:e.type}):e},w=function(t,u){t=p(t);var d,w,y,m=this,S=t.type,h=!1,O=function(){v(m,"writestart progress write writeend".split(" "))},E=function(){if((h||!d)&&(d=n().createObjectURL(t)),w)w.location.href=d;else{var o=e.open(d,"_blank");void 0==o&&"undefined"!=typeof safari&&(e.location.href=d)}m.readyState=m.DONE,O(),l(d)},R=function(e){return function(){return m.readyState!==m.DONE?e.apply(this,arguments):void 0}},b={create:!0,exclusive:!1};return m.readyState=m.INIT,u||(u="download"),r?(d=n().createObjectURL(t),o.href=d,o.download=u,i(o),m.readyState=m.DONE,O(),void l(d)):(e.chrome&&S&&S!==f&&(y=t.slice||t.webkitSlice,t=y.call(t,0,t.size,f),h=!0),a&&"download"!==u&&(u+=".download"),(S===f||a)&&(w=e),c?(s+=t.size,void c(e.TEMPORARY,s,R(function(e){e.root.getDirectory("saved",b,R(function(e){var n=function(){e.getFile(u,b,R(function(e){e.createWriter(R(function(n){n.onwriteend=function(t){w.location.href=e.toURL(),m.readyState=m.DONE,v(m,"writeend",t),l(e)},n.onerror=function(){var e=n.error;e.code!==e.ABORT_ERR&&E()},"writestart progress write abort".split(" ").forEach(function(e){n["on"+e]=m["on"+e]}),n.write(t),m.abort=function(){n.abort(),m.readyState=m.DONE},m.readyState=m.WRITING}),E)}),E)};e.getFile(u,{create:!1},R(function(e){e.remove(),n()}),R(function(e){e.code===e.NOT_FOUND_ERR?n():E()}))}),E)}),E)):void E())},y=w.prototype,m=function(e,t){return new w(e,t)};return"undefined"!=typeof navigator&&navigator.msSaveOrOpenBlob?function(e,t){return navigator.msSaveOrOpenBlob(p(e),t)}:(y.abort=function(){var e=this;e.readyState=e.DONE,v(e,"abort")},y.readyState=y.INIT=0,y.WRITING=1,y.DONE=2,y.error=y.onwritestart=y.onprogress=y.onwrite=y.onabort=y.onerror=y.onwriteend=null,m)}}("undefined"!=typeof self&&self||"undefined"!=typeof window&&window||this.content);"undefined"!=typeof module&&module.exports?module.exports.saveAs=saveAs:"undefined"!=typeof define&&null!==define&&null!=define.amd&&define([],function(){return saveAs});

// Slider
function Range(){this._minimum=this._value=0;this._maximum=100;this._extent=0;this._isChanging=!1}Range.prototype.setValue=function(a,b){a=Math.round(parseFloat(a));if(!isNaN(a)&&this._value!=a&&(this._value=a+this._extent>this._maximum?this._maximum-this._extent:a<this._minimum?this._minimum:a,!this._isChanging&&"function"==typeof this.onchange))this.onchange(b)};Range.prototype.getValue=function(){return this._value};Range.prototype.setExtent=function(a){if(this._extent!=a&&(this._extent=0>a?0:this._value+a>this._maximum?this._maximum-this._value:a,!this._isChanging&&"function"==typeof this.onchange))this.onchange()};Range.prototype.getExtent=function(){return this._extent};Range.prototype.setMinimum=function(a){if(this._minimum!=a){var b=this._isChanging;this._isChanging=!0;this._minimum=a;a>this._value&&this.setValue(a);a>this._maximum&&(this._extent=0,this.setMaximum(a),this.setValue(a));a+this._extent>this._maximum&&(this._extent=this._maximum-this._minimum);this._isChanging=b;if(!this._isChanging&&"function"==typeof this.onchange)this.onchange()}};Range.prototype.getMinimum=function(){return this._minimum};Range.prototype.setMaximum=function(a){if(this._maximum!=a){var b=this._isChanging;this._isChanging=!0;this._maximum=a;a<this._value&&this.setValue(a-this._extent);a<this._minimum&&(this._extent=0,this.setMinimum(a),this.setValue(this._maximum));a<this._minimum+this._extent&&(this._extent=this._maximum-this._minimum);a<this._value+this._extent&&(this._extent=this._maximum-this._value);this._isChanging=b;if(!this._isChanging&&"function"==typeof this.onchange)this.onchange()}};Range.prototype.getMaximum=function(){return this._maximum};function Timer(a){this._pauseTime="undefined"==typeof a?1E3:a;this._timer=null;this._isStarted=!1}Timer.prototype.start=function(){this.isStarted()&&this.stop();var a=this;this._timer=window.setTimeout(function(){if("function"==typeof a.ontimer)a.ontimer()},this._pauseTime);this._isStarted=!1};Timer.prototype.stop=function(){null!=this._timer&&window.clearTimeout(this._timer);this._isStarted=!1};Timer.prototype.isStarted=function(){return this._isStarted};Timer.prototype.getPauseTime=function(){return this._pauseTime};Timer.prototype.setPauseTime=function(a){this._pauseTime=a};Slider.isSupported="undefined"!=typeof document.createElement&&"undefined"!=typeof document.documentElement&&"number"==typeof document.documentElement.offsetWidth;function Slider(a,b,c){if(a){this._orientation=c||"horizontal";this._range=new Range;this._range.setExtent(0);this._blockIncrement=10;this._unitIncrement=1;this._timer=new Timer(100);Slider.isSupported&&a&&(this.document=a.ownerDocument||a.document,this.element=a,this.element.slider=this,this.element.unselectable="on",this.element.className=this._orientation+" "+this.classNameTag+" "+this.element.className,this.line=this.document.createElement("DIV"),this.line.className="line",this.line.unselectable="on",this.line.appendChild(this.document.createElement("DIV")),this.element.appendChild(this.line),this.handle=this.document.createElement("DIV"),this.handle.className="handle",this.handle.unselectable="on",this.handle.appendChild(this.document.createElement("DIV")),this.handle.firstChild.appendChild(this.document.createTextNode(String.fromCharCode(160))),this.element.appendChild(this.handle));this.input=b;var d=this;this._range.onchange=function(e){d.recalculate();if("function"==typeof d.onchange)d.onchange(e);};Slider.isSupported&&a?(this.element.onfocus=Slider.eventHandlers.onfocus,this.element.onblur=Slider.eventHandlers.onblur,this.element.onmousedown=Slider.eventHandlers.onmousedown,this.element.onmouseover=Slider.eventHandlers.onmouseover,this.element.onmouseout=Slider.eventHandlers.onmouseout,this.element.onkeydown=Slider.eventHandlers.onkeydown,this.element.onkeypress=Slider.eventHandlers.onkeypress,this.element.onmousewheel=Slider.eventHandlers.onmousewheel,this.handle.onselectstart=this.element.onselectstart=function(){return!1},this._timer.ontimer=function(){d.ontimer()},window.setTimeout(function(){d.recalculate()},1)):this.input.onchange=function(a){d.setValue(d.input.value)}}};Slider.eventHandlers={getEvent:function(a,b){a||(a=b?b.document.parentWindow.event:window.event);if(!a.srcElement){for(b=a.target;null!=b&&1!=b.nodeType;)b=b.parentNode;a.srcElement=b}"undefined"==typeof a.offsetX&&(a.offsetX=a.layerX,a.offsetY=a.layerY);return a},getDocument:function(a){return a.target?a.target.ownerDocument:a.srcElement.document},getSlider:function(a){for(a=a.target||a.srcElement;null!=a&&null==a.slider;)a=a.parentNode;return a?a.slider:null},getLine:function(a){for(a=a.target||a.srcElement;null!=a&&"line"!=a.className;)a=a.parentNode;return a},getHandle:function(a){a=a.target||a.srcElement;for(var b=/handle/;null!=a&&!b.test(a.className);)a=a.parentNode;return a},onfocus:function(a){a=this.slider;a._focused=!0;a.handle.className="handle hover"},onblur:function(a){a=this.slider;a._focused=!1;a.handle.className="handle"},onmouseover:function(a){a=Slider.eventHandlers.getEvent(a,this);var b=this.slider;a.srcElement==b.handle&&(b.handle.className="handle hover")},onmouseout:function(a){a=Slider.eventHandlers.getEvent(a,this);var b=this.slider;a.srcElement!=b.handle||b._focused||(b.handle.className="handle")},onmousedown:function(a){a=Slider.eventHandlers.getEvent(a,this);var b=this.slider;b.element.focus&&b.element.focus();Slider._currentInstance=b;var c=b.document;c.addEventListener?(c.addEventListener("mousemove",Slider.eventHandlers.onmousemove,!0),c.addEventListener("mouseup",Slider.eventHandlers.onmouseup,!0)):c.attachEvent&&(c.attachEvent("onmousemove",Slider.eventHandlers.onmousemove),c.attachEvent("onmouseup",Slider.eventHandlers.onmouseup),c.attachEvent("onlosecapture",Slider.eventHandlers.onmouseup),b.element.setCapture());Slider.eventHandlers.getHandle(a)?Slider._sliderDragData={screenX:a.screenX,screenY:a.screenY,dx:a.screenX-b.handle.offsetLeft,dy:a.screenY-b.handle.offsetTop,startValue:b.getValue(),slider:b}:(c=Slider.eventHandlers.getLine(a),b._mouseX=a.offsetX+(c?b.line.offsetLeft:0),b._mouseY=a.offsetY+(c?b.line.offsetTop:0),b._increasing=null,b.ontimer())},onmousemove:function(a){a=Slider.eventHandlers.getEvent(a,this);if(Slider._sliderDragData){var b=Slider._sliderDragData.slider,c=b.getMaximum()-b.getMinimum(),d,e;"horizontal"==b._orientation?(d=b.element.offsetWidth-b.handle.offsetWidth,e=a.screenX-Slider._sliderDragData.dx,a=100<Math.abs(a.screenY-Slider._sliderDragData.screenY)):(d=b.element.offsetHeight-b.handle.offsetHeight,e=b.element.offsetHeight-b.handle.offsetHeight-(a.screenY-Slider._sliderDragData.dy),a=100<Math.abs(a.screenX-Slider._sliderDragData.screenX));b.setValue(a?Slider._sliderDragData.startValue:b.getMinimum()+c*e/d,1);return!1}b=Slider._currentInstance;null!=b&&(c=Slider.eventHandlers.getLine(a),b._mouseX=a.offsetX+(c?b.line.offsetLeft:0),b._mouseY=a.offsetY+(c?b.line.offsetTop:0))},onmouseup:function(a){Slider.eventHandlers.getEvent(a,this);a=Slider._currentInstance;var b=a.document;b.removeEventListener?(b.removeEventListener("mousemove",Slider.eventHandlers.onmousemove,!0),b.removeEventListener("mouseup",Slider.eventHandlers.onmouseup,!0)):b.detachEvent&&(b.detachEvent("onmousemove",Slider.eventHandlers.onmousemove),b.detachEvent("onmouseup",Slider.eventHandlers.onmouseup),b.detachEvent("onlosecapture",Slider.eventHandlers.onmouseup),a.element.releaseCapture());Slider._sliderDragData?Slider._sliderDragData=null:(a._timer.stop(),a._increasing=null);Slider._currentInstance=null},onkeydown:function(a){a=Slider.eventHandlers.getEvent(a,this);var b=this.slider;a=a.keyCode;switch(a){case 33:b.setValue(b.getValue()+b.getBlockIncrement(),1);break;case 34:b.setValue(b.getValue()-b.getBlockIncrement(),1);break;case 35:b.setValue("horizontal"==b.getOrientation()?b.getMaximum():b.getMinimum(),1);break;case 36:b.setValue("horizontal"==b.getOrientation()?b.getMinimum():b.getMaximum(),1);break;case 38:case 39:b.setValue(b.getValue()+b.getUnitIncrement(),1);break;case 37:case 40:b.setValue(b.getValue()-b.getUnitIncrement(),1)}if(33<=a&&40>=a)return!1},onkeypress:function(a){a=Slider.eventHandlers.getEvent(a,this);a=a.keyCode;if(33<=a&&40>=a)return!1},onmousewheel:function(a){a=Slider.eventHandlers.getEvent(a,this);var b=this.slider;if(b._focused)return b.setValue(b.getValue()+a.wheelDelta/120*b.getUnitIncrement(),1),!1}};Slider.prototype.classNameTag="dynamic-slider-control";Slider.prototype.setValue=function(a,b){this._range.setValue(a,b);this.input.value=this.getValue()};Slider.prototype.getValue=function(){return this._range.getValue()};Slider.prototype.setMinimum=function(a){this._range.setMinimum(a);this.input.value=this.getValue()};Slider.prototype.getMinimum=function(){return this._range.getMinimum()};Slider.prototype.setMaximum=function(a){this._range.setMaximum(a);this.input.value=this.getValue()};Slider.prototype.getMaximum=function(){return this._range.getMaximum()};Slider.prototype.setUnitIncrement=function(a){this._unitIncrement=a};Slider.prototype.getUnitIncrement=function(){return this._unitIncrement};Slider.prototype.setBlockIncrement=function(a){this._blockIncrement=a};Slider.prototype.getBlockIncrement=function(){return this._blockIncrement};Slider.prototype.getOrientation=function(){return this._orientation};Slider.prototype.setOrientation=function(a){a!=this._orientation&&(Slider.isSupported&&this.element&&(this.element.className=this.element.className.replace(this._orientation,a)),this._orientation=a,this.recalculate())};Slider.prototype.recalculate=function(){if(Slider.isSupported&&this.element){var a=this.element.offsetWidth,b=this.element.offsetHeight,c=this.handle.offsetWidth,d=this.handle.offsetHeight,e=this.line.offsetWidth,f=this.line.offsetHeight;"horizontal"==this._orientation?(this.handle.style.left=(a-c)*(this.getValue()-this.getMinimum())/(this.getMaximum()-this.getMinimum())+"px",this.handle.style.top= 0 ,this.line.style.top=(b-f)/2+"px",this.line.style.left=c/2+"px",this.line.style.width=Math.max(0,a-c-2)+"px",this.line.firstChild.style.width=Math.max(0,a-c-4)+"px"):(this.handle.style.left=(a-c)/2+"px",this.handle.style.top=b-d-(b-d)*(this.getValue()-this.getMinimum())/(this.getMaximum()-this.getMinimum())+"px",this.line.style.left=(a-e)/2+"px",this.line.style.top=d/2+"px",this.line.style.height=Math.max(0,b-d-2)+"px",this.line.firstChild.style.height=Math.max(0,b-d-4)+"px")}};Slider.prototype.ontimer=function(){var a=this.handle.offsetWidth,b=this.handle.offsetHeight,c=this.handle.offsetLeft,d=this.handle.offsetTop;"horizontal"==this._orientation?this._mouseX>c+a&&(null==this._increasing||this._increasing)?(this.setValue(this.getValue()+this.getBlockIncrement()),this._increasing=!0):this._mouseX<c&&(null==this._increasing||!this._increasing)&&(this.setValue(this.getValue()-this.getBlockIncrement()),this._increasing=!1):this._mouseY>d+b&&(null==this._increasing||!this._increasing)?(this.setValue(this.getValue()-this.getBlockIncrement()),this._increasing=!1):this._mouseY<d&&(null==this._increasing||this._increasing)&&(this.setValue(this.getValue()+this.getBlockIncrement()),this._increasing=!0);};

// Favicon
!function(){var e=function(e){"use strict";function t(e){if(e.paused||e.ended||g)return!1;try{f.clearRect(0,0,s,l),f.drawImage(e,0,0,s,l)}catch(o){}p=setTimeout(function(){t(e)},S.duration),O.setIcon(h)}function o(e){var t=/^#?([a-f\d])([a-f\d])([a-f\d])$/i;e=e.replace(t,function(e,t,o,n){return t+t+o+o+n+n});var o=/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(e);return o?{r:parseInt(o[1],16),g:parseInt(o[2],16),b:parseInt(o[3],16)}:!1}function n(e,t){var o,n={};for(o in e)n[o]=e[o];for(o in t)n[o]=t[o];return n}function r(){return b.hidden||b.msHidden||b.webkitHidden||b.mozHidden}e=e?e:{};var i,a,l,s,h,f,c,d,u,y,w,g,x,m,p,b,v={bgColor:"#d00",textColor:"#fff",fontFamily:"sans-serif",fontStyle:"bold",type:"circle",position:"down",animation:"slide",elementId:!1,dataUrl:!1,win:window};x={},x.ff="undefined"!=typeof InstallTrigger,x.chrome=!!window.chrome,x.opera=!!window.opera||navigator.userAgent.indexOf("Opera")>=0,x.ie=/*@cc_on!@*/!1,x.safari=Object.prototype.toString.call(window.HTMLElement).indexOf("Constructor")>0,x.supported=x.chrome||x.ff||x.opera;var C=[];w=function(){},d=g=!1;var E=function(){i=n(v,e),i.bgColor=o(i.bgColor),i.textColor=o(i.textColor),i.position=i.position.toLowerCase(),i.animation=S.types[""+i.animation]?i.animation:v.animation,b=i.win.document;var t=i.position.indexOf("up")>-1,r=i.position.indexOf("left")>-1;if(t||r)for(var d=0;d<S.types[""+i.animation].length;d++){var u=S.types[""+i.animation][d];t&&(u.y=u.y<.6?u.y-.4:u.y-2*u.y+(1-u.w)),r&&(u.x=u.x<.6?u.x-.4:u.x-2*u.x+(1-u.h)),S.types[""+i.animation][d]=u}i.type=A[""+i.type]?i.type:v.type,a=O.getIcon(),h=document.createElement("canvas"),c=document.createElement("img"),a.hasAttribute("href")?(c.setAttribute("crossOrigin","anonymous"),c.onload=function(){l=c.height>0?c.height:32,s=c.width>0?c.width:32,h.height=l,h.width=s,f=h.getContext("2d"),M.ready()},c.setAttribute("src",a.getAttribute("href"))):(c.onload=function(){l=32,s=32,c.height=l,c.width=s,h.height=l,h.width=s,f=h.getContext("2d"),M.ready()},c.setAttribute("src",""))},M={};M.ready=function(){d=!0,M.reset(),w()},M.reset=function(){d&&(C=[],u=!1,y=!1,f.clearRect(0,0,s,l),f.drawImage(c,0,0,s,l),O.setIcon(h),window.clearTimeout(m),window.clearTimeout(p))},M.start=function(){if(d&&!y){var e=function(){u=C[0],y=!1,C.length>0&&(C.shift(),M.start())};if(C.length>0){y=!0;var t=function(){["type","animation","bgColor","textColor","fontFamily","fontStyle"].forEach(function(e){e in C[0].options&&(i[e]=C[0].options[e])}),S.run(C[0].options,function(){e()},!1)};u?S.run(u.options,function(){t()},!0):t()}}};var A={},I=function(e){return e.n="number"==typeof e.n?Math.abs(0|e.n):e.n,e.x=s*e.x,e.y=l*e.y,e.w=s*e.w,e.h=l*e.h,e.len=(""+e.n).length,e};A.circle=function(e){e=I(e);var t=!1;2===e.len?(e.x=e.x-.4*e.w,e.w=1.4*e.w,t=!0):e.len>=3&&(e.x=e.x-.65*e.w,e.w=1.65*e.w,t=!0),f.clearRect(0,0,s,l),f.drawImage(c,0,0,s,l),f.beginPath(),f.font=i.fontStyle+" "+Math.floor(e.h*(e.n>99?.85:1))+"px "+i.fontFamily,f.textAlign="center",t?(f.moveTo(e.x+e.w/2,e.y),f.lineTo(e.x+e.w-e.h/2,e.y),f.quadraticCurveTo(e.x+e.w,e.y,e.x+e.w,e.y+e.h/2),f.lineTo(e.x+e.w,e.y+e.h-e.h/2),f.quadraticCurveTo(e.x+e.w,e.y+e.h,e.x+e.w-e.h/2,e.y+e.h),f.lineTo(e.x+e.h/2,e.y+e.h),f.quadraticCurveTo(e.x,e.y+e.h,e.x,e.y+e.h-e.h/2),f.lineTo(e.x,e.y+e.h/2),f.quadraticCurveTo(e.x,e.y,e.x+e.h/2,e.y)):f.arc(e.x+e.w/2,e.y+e.h/2,e.h/2,0,2*Math.PI),f.fillStyle="rgba("+i.bgColor.r+","+i.bgColor.g+","+i.bgColor.b+","+e.o+")",f.fill(),f.closePath(),f.beginPath(),f.stroke(),f.fillStyle="rgba("+i.textColor.r+","+i.textColor.g+","+i.textColor.b+","+e.o+")","number"==typeof e.n&&e.n>999?f.fillText((e.n>9999?9:Math.floor(e.n/1e3))+"k+",Math.floor(e.x+e.w/2),Math.floor(e.y+e.h-.2*e.h)):f.fillText(e.n,Math.floor(e.x+e.w/2),Math.floor(e.y+e.h-.15*e.h)),f.closePath()},A.rectangle=function(e){e=I(e);var t=!1;2===e.len?(e.x=e.x-.4*e.w,e.w=1.4*e.w,t=!0):e.len>=3&&(e.x=e.x-.65*e.w,e.w=1.65*e.w,t=!0),f.clearRect(0,0,s,l),f.drawImage(c,0,0,s,l),f.beginPath(),f.font=i.fontStyle+" "+Math.floor(e.h*(e.n>99?.9:1))+"px "+i.fontFamily,f.textAlign="center",f.fillStyle="rgba("+i.bgColor.r+","+i.bgColor.g+","+i.bgColor.b+","+e.o+")",f.fillRect(e.x,e.y,e.w,e.h),f.fillStyle="rgba("+i.textColor.r+","+i.textColor.g+","+i.textColor.b+","+e.o+")","number"==typeof e.n&&e.n>999?f.fillText((e.n>9999?9:Math.floor(e.n/1e3))+"k+",Math.floor(e.x+e.w/2),Math.floor(e.y+e.h-.2*e.h)):f.fillText(e.n,Math.floor(e.x+e.w/2),Math.floor(e.y+e.h-.15*e.h)),f.closePath()};var T=function(e,t){t=("string"==typeof t?{animation:t}:t)||{},w=function(){try{if("number"==typeof e?e>0:""!==e){var n={type:"badge",options:{n:e}};if("animation"in t&&S.types[""+t.animation]&&(n.options.animation=""+t.animation),"type"in t&&A[""+t.type]&&(n.options.type=""+t.type),["bgColor","textColor"].forEach(function(e){e in t&&(n.options[e]=o(t[e]))}),["fontStyle","fontFamily"].forEach(function(e){e in t&&(n.options[e]=t[e])}),C.push(n),C.length>100)throw new Error("Too many badges requests in queue.");M.start()}else M.reset()}catch(r){throw new Error("Error setting badge. Message: "+r.message)}},d&&w()},U=function(e){w=function(){try{var t=e.width,o=e.height,n=document.createElement("img"),r=o/l>t/s?t/s:o/l;n.setAttribute("crossOrigin","anonymous"),n.onload=function(){f.clearRect(0,0,s,l),f.drawImage(n,0,0,s,l),O.setIcon(h)},n.setAttribute("src",e.getAttribute("src")),n.height=o/r,n.width=t/r}catch(i){throw new Error("Error setting image. Message: "+i.message)}},d&&w()},R=function(e){w=function(){try{if("stop"===e)return g=!0,M.reset(),void(g=!1);e.addEventListener("play",function(){t(this)},!1)}catch(o){throw new Error("Error setting video. Message: "+o.message)}},d&&w()},L=function(e){if(window.URL&&window.URL.createObjectURL||(window.URL=window.URL||{},window.URL.createObjectURL=function(e){return e}),x.supported){var o=!1;navigator.getUserMedia=navigator.getUserMedia||navigator.oGetUserMedia||navigator.msGetUserMedia||navigator.mozGetUserMedia||navigator.webkitGetUserMedia,w=function(){try{if("stop"===e)return g=!0,M.reset(),void(g=!1);o=document.createElement("video"),o.width=s,o.height=l,navigator.getUserMedia({video:!0,audio:!1},function(e){o.src=URL.createObjectURL(e),o.play(),t(o)},function(){})}catch(n){throw new Error("Error setting webcam. Message: "+n.message)}},d&&w()}},O={};O.getIcon=function(){var e=!1,t=function(){for(var e=b.getElementsByTagName("head")[0].getElementsByTagName("link"),t=e.length,o=t-1;o>=0;o--)if(/(^|\s)icon(\s|$)/i.test(e[o].getAttribute("rel")))return e[o];return!1};return i.element?e=i.element:i.elementId?(e=b.getElementById(i.elementId),e.setAttribute("href",e.getAttribute("src"))):(e=t(),e===!1&&(e=b.createElement("link"),e.setAttribute("rel","icon"),b.getElementsByTagName("head")[0].appendChild(e))),e.setAttribute("type","image/png"),e},O.setIcon=function(e){var t=e.toDataURL("image/png");if(i.dataUrl&&i.dataUrl(t),i.element)i.element.setAttribute("href",t),i.element.setAttribute("src",t);else if(i.elementId){var o=b.getElementById(i.elementId);o.setAttribute("href",t),o.setAttribute("src",t)}else if(x.ff||x.opera){var n=a;a=b.createElement("link"),x.opera&&a.setAttribute("rel","icon"),a.setAttribute("rel","icon"),a.setAttribute("type","image/png"),b.getElementsByTagName("head")[0].appendChild(a),a.setAttribute("href",t),n.parentNode&&n.parentNode.removeChild(n)}else a.setAttribute("href",t)};var S={};return S.duration=40,S.types={},S.types.fade=[{x:.4,y:.4,w:.6,h:.6,o:0},{x:.4,y:.4,w:.6,h:.6,o:.1},{x:.4,y:.4,w:.6,h:.6,o:.2},{x:.4,y:.4,w:.6,h:.6,o:.3},{x:.4,y:.4,w:.6,h:.6,o:.4},{x:.4,y:.4,w:.6,h:.6,o:.5},{x:.4,y:.4,w:.6,h:.6,o:.6},{x:.4,y:.4,w:.6,h:.6,o:.7},{x:.4,y:.4,w:.6,h:.6,o:.8},{x:.4,y:.4,w:.6,h:.6,o:.9},{x:.4,y:.4,w:.6,h:.6,o:1}],S.types.none=[{x:.4,y:.4,w:.6,h:.6,o:1}],S.types.pop=[{x:1,y:1,w:0,h:0,o:1},{x:.9,y:.9,w:.1,h:.1,o:1},{x:.8,y:.8,w:.2,h:.2,o:1},{x:.7,y:.7,w:.3,h:.3,o:1},{x:.6,y:.6,w:.4,h:.4,o:1},{x:.5,y:.5,w:.5,h:.5,o:1},{x:.4,y:.4,w:.6,h:.6,o:1}],S.types.popFade=[{x:.75,y:.75,w:0,h:0,o:0},{x:.65,y:.65,w:.1,h:.1,o:.2},{x:.6,y:.6,w:.2,h:.2,o:.4},{x:.55,y:.55,w:.3,h:.3,o:.6},{x:.5,y:.5,w:.4,h:.4,o:.8},{x:.45,y:.45,w:.5,h:.5,o:.9},{x:.4,y:.4,w:.6,h:.6,o:1}],S.types.slide=[{x:.4,y:1,w:.6,h:.6,o:1},{x:.4,y:.9,w:.6,h:.6,o:1},{x:.4,y:.9,w:.6,h:.6,o:1},{x:.4,y:.8,w:.6,h:.6,o:1},{x:.4,y:.7,w:.6,h:.6,o:1},{x:.4,y:.6,w:.6,h:.6,o:1},{x:.4,y:.5,w:.6,h:.6,o:1},{x:.4,y:.4,w:.6,h:.6,o:1}],S.run=function(e,t,o,a){var l=S.types[r()?"none":i.animation];return a=o===!0?"undefined"!=typeof a?a:l.length-1:"undefined"!=typeof a?a:0,t=t?t:function(){},a<l.length&&a>=0?(A[i.type](n(e,l[a])),m=setTimeout(function(){o?a-=1:a+=1,S.run(e,t,o,a)},S.duration),O.setIcon(h),void 0):void t()},E(),{badge:T,video:R,image:U,webcam:L,reset:M.reset,browser:{supported:x.supported}}};"undefined"!=typeof define&&define.amd?define([],function(){return e}):"undefined"!=typeof module&&module.exports?module.exports=e:this.Favico=e}();

if(!Object.assign){Object.defineProperty(Object,'assign',{enumerable: false,
configurable: true,writable: true,
value: function(target){'use strict';if (target === undefined || target === null) {
throw new TypeError('Cannot convert first argument to object');}var to = Object(target);
for (var i = 1; i < arguments.length; i++) {
var nextSource = arguments[i];
if (nextSource === undefined || nextSource === null) {
continue;
}
nextSource = Object(nextSource);

var keysArray = Object.keys(nextSource);
for (var nextIndex = 0, len = keysArray.length; nextIndex < len; nextIndex++) {
var nextKey = keysArray[nextIndex];
var desc = Object.getOwnPropertyDescriptor(nextSource, nextKey);
if (desc !== undefined && desc.enumerable) {
to[nextKey] = nextSource[nextKey];
}
}
}
return to;
}
});
}


/**
 * Copyright Marc J. Schmidt. See the LICENSE file at the top-level
 * directory of this distribution and at
 * https://github.com/marcj/css-element-queries/blob/master/LICENSE.
 */
;
(function (root, factory) {
	if (typeof define === "function" && define.amd) {
		define(factory);
	} else if (typeof exports === "object") {
		module.exports = factory();
	} else {
		root.ResizeSensor = factory();
	}
}(typeof window !== 'undefined' ? window : this, function () {

	// Make sure it does not throw in a SSR (Server Side Rendering) situation
	if (typeof window === "undefined") {
		return null;
	}
	// Only used for the dirty checking, so the event callback count is limited to max 1 call per fps per sensor.
	// In combination with the event based resize sensor this saves cpu time, because the sensor is too fast and
	// would generate too many unnecessary events.
	var requestAnimationFrame = window.requestAnimationFrame ||
		window.mozRequestAnimationFrame ||
		window.webkitRequestAnimationFrame ||
		function (fn) {
			return window.setTimeout(fn, 20);
		};

	/**
	 * Iterate over each of the provided element(s).
	 *
	 * @param {HTMLElement|HTMLElement[]} elements
	 * @param {Function}                  callback
	 */
	function forEachElement(elements, callback){
		var elementsType = Object.prototype.toString.call(elements);
		var isCollectionTyped = ('[object Array]' === elementsType
			|| ('[object NodeList]' === elementsType)
			|| ('[object HTMLCollection]' === elementsType)
			|| ('[object Object]' === elementsType)
			|| ('undefined' !== typeof jQuery && elements instanceof jQuery) //jquery
			|| ('undefined' !== typeof Elements && elements instanceof Elements) //mootools
		);
		var i = 0, j = elements.length;
		if (isCollectionTyped) {
			for (; i < j; i++) {
				callback(elements[i]);
			}
		} else {
			callback(elements);
		}
	}

	/**
	 * Class for dimension change detection.
	 *
	 * @param {Element|Element[]|Elements|jQuery} element
	 * @param {Function} callback
	 *
	 * @constructor
	 */
	var ResizeSensor = function(element, callback) {
		/**
		 *
		 * @constructor
		 */
		function EventQueue() {
			var q = [];
			this.add = function(ev) {
				q.push(ev);
			};

			var i, j;
			this.call = function() {
				for (i = 0, j = q.length; i < j; i++) {
					q[i].call();
				}
			};

			this.remove = function(ev) {
				var newQueue = [];
				for(i = 0, j = q.length; i < j; i++) {
					if(q[i] !== ev) newQueue.push(q[i]);
				}
				q = newQueue;
			}

			this.length = function() {
				return q.length;
			}
		}

		/**
		 *
		 * @param {HTMLElement} element
		 * @param {Function}    resized
		 */
		function attachResizeEvent(element, resized) {
			if (!element) return;
			if (element.resizedAttached) {
				element.resizedAttached.add(resized);
				return;
			}

			element.resizedAttached = new EventQueue();
			element.resizedAttached.add(resized);

			element.resizeSensor = document.createElement('div');
			element.resizeSensor.className = 'resize-sensor';
			var style = 'position: absolute; left: 0; top: 0; right: 0; bottom: 0; overflow: hidden; z-index: -1; visibility: hidden;';
			var styleChild = 'position: absolute; left: 0; top: 0; transition: 0s;';

			element.resizeSensor.style.cssText = style;
			element.resizeSensor.innerHTML =
				'<div class="resize-sensor-expand" style="' + style + '">' +
				'<div style="' + styleChild + '"></div>' +
				'</div>' +
				'<div class="resize-sensor-shrink" style="' + style + '">' +
				'<div style="' + styleChild + ' width: 200%; height: 200%"></div>' +
				'</div>';
			element.appendChild(element.resizeSensor);

			if (element.resizeSensor.offsetParent !== element) {
				element.style.position = 'relative';
			}

			var expand = element.resizeSensor.childNodes[0];
			var expandChild = expand.childNodes[0];
			var shrink = element.resizeSensor.childNodes[1];
			var dirty, rafId, newWidth, newHeight;
			var lastWidth = element.offsetWidth;
			var lastHeight = element.offsetHeight;

			var reset = function() {
				expandChild.style.width = '100000px';
				expandChild.style.height = '100000px';

				expand.scrollLeft = 100000;
				expand.scrollTop = 100000;

				shrink.scrollLeft = 100000;
				shrink.scrollTop = 100000;
			};

			reset();

			var onResized = function() {
				rafId = 0;

				if (!dirty) return;

				lastWidth = newWidth;
				lastHeight = newHeight;

				if (element.resizedAttached) {
					element.resizedAttached.call();
				}
			};

			var onScroll = function() {
				newWidth = element.offsetWidth;
				newHeight = element.offsetHeight;
				dirty = newWidth != lastWidth || newHeight != lastHeight;

				if (dirty && !rafId) {
					rafId = requestAnimationFrame(onResized);
				}

				reset();
			};

			var addEvent = function(el, name, cb) {
				if (el.attachEvent) {
					el.attachEvent('on' + name, cb);
				} else {
					el.addEventListener(name, cb);
				}
			};

			addEvent(expand, 'scroll', onScroll);
			addEvent(shrink, 'scroll', onScroll);
		}

		forEachElement(element, function(elem){
			attachResizeEvent(elem, callback);
		});

		this.detach = function(ev) {
			ResizeSensor.detach(element, ev);
		};
	};

	ResizeSensor.detach = function(element, ev) {
		forEachElement(element, function(elem){
			if (!elem) return
			if(elem.resizedAttached && typeof ev == "function"){
				elem.resizedAttached.remove(ev);
				if(elem.resizedAttached.length()) return;
			}
			if (elem.resizeSensor) {
				if (elem.contains(elem.resizeSensor)) {
					elem.removeChild(elem.resizeSensor);
				}
				delete elem.resizeSensor;
				delete elem.resizedAttached;
			}
		});
	};

	return ResizeSensor;

}));