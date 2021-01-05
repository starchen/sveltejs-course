
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(window.document);
var app = (function () {
    'use strict';

    function noop() { }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }

    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function prevent_default(fn) {
        return function (event) {
            event.preventDefault();
            // @ts-ignore
            return fn.call(this, event);
        };
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_input_value(input, value) {
        input.value = value == null ? '' : value;
    }
    function custom_event(type, detail) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, false, false, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    let flushing = false;
    const seen_callbacks = new Set();
    function flush() {
        if (flushing)
            return;
        flushing = true;
        do {
            // first, call beforeUpdate functions
            // and update components
            for (let i = 0; i < dirty_components.length; i += 1) {
                const component = dirty_components[i];
                set_current_component(component);
                update(component.$$);
            }
            set_current_component(null);
            dirty_components.length = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        flushing = false;
        seen_callbacks.clear();
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }
    function each(items, fn) {
        let str = '';
        for (let i = 0; i < items.length; i += 1) {
            str += fn(items[i], i);
        }
        return str;
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        // onMount happens before the initial afterUpdate
        add_render_callback(() => {
            const new_on_destroy = on_mount.map(run).filter(is_function);
            if (on_destroy) {
                on_destroy.push(...new_on_destroy);
            }
            else {
                // Edge case - component was destroyed immediately,
                // most likely as a result of a binding initialising
                run_all(new_on_destroy);
            }
            component.$$.on_mount = [];
        });
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const prop_values = options.props || {};
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            before_update: [],
            after_update: [],
            context: new Map(parent_component ? parent_component.$$.context : []),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, prop_values, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor);
            flush();
        }
        set_current_component(parent_component);
    }
    /**
     * Base class for Svelte components. Used when dev=false.
     */
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.31.1' }, detail)));
    }
    function append_dev(target, node) {
        dispatch_dev('SvelteDOMInsert', { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev('SvelteDOMInsert', { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev('SvelteDOMRemove', { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ['capture'] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev('SvelteDOMAddEventListener', { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev('SvelteDOMRemoveEventListener', { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    /**
     * Base class for Svelte components with some minor dev-enhancements. Used when dev=true.
     */
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error("'target' is a required option");
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn('Component was already destroyed'); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    /* src/Meetups/MeetupItem.svelte generated by Svelte v3.31.1 */

    const file = "src/Meetups/MeetupItem.svelte";

    function create_fragment(ctx) {
    	let article;
    	let header;
    	let h1;
    	let t1;
    	let h2;
    	let t3;
    	let div;
    	let p;
    	let t8;
    	let footer;
    	let a;
    	let t9;
    	let a_href_value;
    	let t10;
    	let button0;
    	let t12;
    	let button1;

    	const block = {
    		c: function create() {
    			article = element("article");
    			header = element("header");
    			h1 = element("h1");
    			h1.textContent = `${/*title*/ ctx[0]}`;
    			t1 = space();
    			h2 = element("h2");
    			h2.textContent = `${/*subtitle*/ ctx[1]}`;
    			t3 = space();
    			div = element("div");
    			p = element("p");
    			p.textContent = `Welcome to the ${/*title*/ ctx[0]}: ${/*description*/ ctx[2]}`;
    			t8 = space();
    			footer = element("footer");
    			a = element("a");
    			t9 = text("Mail");
    			t10 = space();
    			button0 = element("button");
    			button0.textContent = "Show details";
    			t12 = space();
    			button1 = element("button");
    			button1.textContent = "Favorite";
    			add_location(h1, file, 30, 8, 472);
    			add_location(h2, file, 31, 8, 497);
    			attr_dev(header, "class", "svelte-1asl10c");
    			add_location(header, file, 29, 4, 455);
    			attr_dev(p, "class", "svelte-1asl10c");
    			add_location(p, file, 34, 8, 565);
    			attr_dev(div, "class", "content svelte-1asl10c");
    			add_location(div, file, 33, 4, 535);
    			attr_dev(a, "href", a_href_value = "mailto:" + /*contact*/ ctx[3]);
    			add_location(a, file, 37, 8, 642);
    			add_location(button0, file, 38, 8, 686);
    			add_location(button1, file, 39, 8, 724);
    			attr_dev(footer, "class", "svelte-1asl10c");
    			add_location(footer, file, 36, 4, 625);
    			attr_dev(article, "class", "svelte-1asl10c");
    			add_location(article, file, 28, 0, 441);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, article, anchor);
    			append_dev(article, header);
    			append_dev(header, h1);
    			append_dev(header, t1);
    			append_dev(header, h2);
    			append_dev(article, t3);
    			append_dev(article, div);
    			append_dev(div, p);
    			append_dev(article, t8);
    			append_dev(article, footer);
    			append_dev(footer, a);
    			append_dev(a, t9);
    			append_dev(footer, t10);
    			append_dev(footer, button0);
    			append_dev(footer, t12);
    			append_dev(footer, button1);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(article);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("MeetupItem", slots, []);
    	let { meetup } = $$props;
    	const { id, title, subtitle, description, contact } = meetup;
    	const writable_props = ["meetup"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<MeetupItem> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("meetup" in $$props) $$invalidate(4, meetup = $$props.meetup);
    	};

    	$$self.$capture_state = () => ({
    		meetup,
    		id,
    		title,
    		subtitle,
    		description,
    		contact
    	});

    	$$self.$inject_state = $$props => {
    		if ("meetup" in $$props) $$invalidate(4, meetup = $$props.meetup);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [title, subtitle, description, contact, meetup];
    }

    class MeetupItem extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, { meetup: 4 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "MeetupItem",
    			options,
    			id: create_fragment.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*meetup*/ ctx[4] === undefined && !("meetup" in props)) {
    			console.warn("<MeetupItem> was created without expected prop 'meetup'");
    		}
    	}

    	get meetup() {
    		throw new Error("<MeetupItem>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set meetup(value) {
    		throw new Error("<MeetupItem>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/Meetups/MeetupGrid.svelte generated by Svelte v3.31.1 */
    const file$1 = "src/Meetups/MeetupGrid.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[1] = list[i];
    	return child_ctx;
    }

    // (23:4) {#each meetups as meetup}
    function create_each_block(ctx) {
    	let meetupitem;
    	let current;

    	meetupitem = new MeetupItem({
    			props: { meetup: /*meetup*/ ctx[1] },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(meetupitem.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(meetupitem, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const meetupitem_changes = {};
    			if (dirty & /*meetups*/ 1) meetupitem_changes.meetup = /*meetup*/ ctx[1];
    			meetupitem.$set(meetupitem_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(meetupitem.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(meetupitem.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(meetupitem, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(23:4) {#each meetups as meetup}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$1(ctx) {
    	let section;
    	let current;
    	let each_value = /*meetups*/ ctx[0];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			section = element("section");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(section, "id", "meetups");
    			attr_dev(section, "class", "svelte-7iyw6p");
    			add_location(section, file$1, 21, 0, 355);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, section, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(section, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*meetups*/ 1) {
    				each_value = /*meetups*/ ctx[0];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(section, null);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(section);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("MeetupGrid", slots, []);
    	let { meetups } = $$props;
    	const writable_props = ["meetups"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<MeetupGrid> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("meetups" in $$props) $$invalidate(0, meetups = $$props.meetups);
    	};

    	$$self.$capture_state = () => ({ MeetupItem, meetups });

    	$$self.$inject_state = $$props => {
    		if ("meetups" in $$props) $$invalidate(0, meetups = $$props.meetups);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [meetups];
    }

    class MeetupGrid extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, { meetups: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "MeetupGrid",
    			options,
    			id: create_fragment$1.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*meetups*/ ctx[0] === undefined && !("meetups" in props)) {
    			console.warn("<MeetupGrid> was created without expected prop 'meetups'");
    		}
    	}

    	get meetups() {
    		throw new Error("<MeetupGrid>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set meetups(value) {
    		throw new Error("<MeetupGrid>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/UI/Header.svelte generated by Svelte v3.31.1 */

    const file$2 = "src/UI/Header.svelte";

    function create_fragment$2(ctx) {
    	let header;
    	let h1;

    	const block = {
    		c: function create() {
    			header = element("header");
    			h1 = element("h1");
    			h1.textContent = "Meet Us !!";
    			attr_dev(h1, "class", "svelte-qnyrsy");
    			add_location(h1, file$2, 21, 4, 425);
    			attr_dev(header, "class", "svelte-qnyrsy");
    			add_location(header, file$2, 20, 0, 412);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, header, anchor);
    			append_dev(header, h1);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(header);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Header", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Header> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class Header extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Header",
    			options,
    			id: create_fragment$2.name
    		});
    	}
    }

    /* src/App.svelte generated by Svelte v3.31.1 */
    const file$3 = "src/App.svelte";

    function create_fragment$3(ctx) {
    	let header;
    	let t0;
    	let main;
    	let form;
    	let div0;
    	let label0;
    	let t2;
    	let input0;
    	let t3;
    	let div1;
    	let label1;
    	let t5;
    	let input1;
    	let t6;
    	let div2;
    	let label2;
    	let t8;
    	let input2;
    	let t9;
    	let div3;
    	let label3;
    	let t11;
    	let input3;
    	let t12;
    	let div4;
    	let label4;
    	let t14;
    	let textarea;
    	let t15;
    	let button;
    	let t17;
    	let meetupgrid;
    	let current;
    	let mounted;
    	let dispose;
    	header = new Header({ $$inline: true });

    	meetupgrid = new MeetupGrid({
    			props: { meetups: /*meetups*/ ctx[5] },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(header.$$.fragment);
    			t0 = space();
    			main = element("main");
    			form = element("form");
    			div0 = element("div");
    			label0 = element("label");
    			label0.textContent = "Title";
    			t2 = space();
    			input0 = element("input");
    			t3 = space();
    			div1 = element("div");
    			label1 = element("label");
    			label1.textContent = "Subtitle";
    			t5 = space();
    			input1 = element("input");
    			t6 = space();
    			div2 = element("div");
    			label2 = element("label");
    			label2.textContent = "Contact";
    			t8 = space();
    			input2 = element("input");
    			t9 = space();
    			div3 = element("div");
    			label3 = element("label");
    			label3.textContent = "Address";
    			t11 = space();
    			input3 = element("input");
    			t12 = space();
    			div4 = element("div");
    			label4 = element("label");
    			label4.textContent = "Description";
    			t14 = space();
    			textarea = element("textarea");
    			t15 = space();
    			button = element("button");
    			button.textContent = "Add meetup";
    			t17 = space();
    			create_component(meetupgrid.$$.fragment);
    			attr_dev(label0, "for", "title");
    			add_location(label0, file$3, 55, 12, 1336);
    			attr_dev(input0, "type", "text");
    			attr_dev(input0, "id", "title");
    			add_location(input0, file$3, 56, 12, 1381);
    			attr_dev(div0, "class", "form-control");
    			add_location(div0, file$3, 54, 8, 1297);
    			attr_dev(label1, "for", "subtitle");
    			add_location(label1, file$3, 59, 12, 1496);
    			attr_dev(input1, "type", "text");
    			attr_dev(input1, "id", "subtitle");
    			add_location(input1, file$3, 60, 12, 1547);
    			attr_dev(div1, "class", "form-control");
    			add_location(div1, file$3, 58, 8, 1457);
    			attr_dev(label2, "for", "contact");
    			add_location(label2, file$3, 63, 12, 1668);
    			attr_dev(input2, "type", "text");
    			attr_dev(input2, "id", "contact");
    			add_location(input2, file$3, 64, 12, 1717);
    			attr_dev(div2, "class", "form-control");
    			add_location(div2, file$3, 62, 8, 1629);
    			attr_dev(label3, "for", "address");
    			add_location(label3, file$3, 67, 12, 1836);
    			attr_dev(input3, "type", "text");
    			attr_dev(input3, "id", "address");
    			add_location(input3, file$3, 68, 12, 1885);
    			attr_dev(div3, "class", "form-control");
    			add_location(div3, file$3, 66, 8, 1797);
    			attr_dev(label4, "for", "description");
    			add_location(label4, file$3, 71, 12, 2004);
    			attr_dev(textarea, "rows", "3");
    			attr_dev(textarea, "id", "description");
    			add_location(textarea, file$3, 72, 12, 2061);
    			attr_dev(div4, "class", "form-control");
    			add_location(div4, file$3, 70, 8, 1965);
    			attr_dev(button, "type", "submit");
    			add_location(button, file$3, 74, 8, 2157);
    			add_location(form, file$3, 53, 4, 1243);
    			attr_dev(main, "class", "svelte-r5b0o4");
    			add_location(main, file$3, 52, 0, 1232);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(header, target, anchor);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, main, anchor);
    			append_dev(main, form);
    			append_dev(form, div0);
    			append_dev(div0, label0);
    			append_dev(div0, t2);
    			append_dev(div0, input0);
    			set_input_value(input0, /*title*/ ctx[0]);
    			append_dev(form, t3);
    			append_dev(form, div1);
    			append_dev(div1, label1);
    			append_dev(div1, t5);
    			append_dev(div1, input1);
    			set_input_value(input1, /*subtitle*/ ctx[1]);
    			append_dev(form, t6);
    			append_dev(form, div2);
    			append_dev(div2, label2);
    			append_dev(div2, t8);
    			append_dev(div2, input2);
    			set_input_value(input2, /*contact*/ ctx[2]);
    			append_dev(form, t9);
    			append_dev(form, div3);
    			append_dev(div3, label3);
    			append_dev(div3, t11);
    			append_dev(div3, input3);
    			set_input_value(input3, /*address*/ ctx[4]);
    			append_dev(form, t12);
    			append_dev(form, div4);
    			append_dev(div4, label4);
    			append_dev(div4, t14);
    			append_dev(div4, textarea);
    			set_input_value(textarea, /*description*/ ctx[3]);
    			append_dev(form, t15);
    			append_dev(form, button);
    			append_dev(main, t17);
    			mount_component(meetupgrid, main, null);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(input0, "input", /*input0_input_handler*/ ctx[7]),
    					listen_dev(input1, "input", /*input1_input_handler*/ ctx[8]),
    					listen_dev(input2, "input", /*input2_input_handler*/ ctx[9]),
    					listen_dev(input3, "input", /*input3_input_handler*/ ctx[10]),
    					listen_dev(textarea, "input", /*textarea_input_handler*/ ctx[11]),
    					listen_dev(form, "submit", prevent_default(/*addMeetup*/ ctx[6]), false, true, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*title*/ 1 && input0.value !== /*title*/ ctx[0]) {
    				set_input_value(input0, /*title*/ ctx[0]);
    			}

    			if (dirty & /*subtitle*/ 2 && input1.value !== /*subtitle*/ ctx[1]) {
    				set_input_value(input1, /*subtitle*/ ctx[1]);
    			}

    			if (dirty & /*contact*/ 4 && input2.value !== /*contact*/ ctx[2]) {
    				set_input_value(input2, /*contact*/ ctx[2]);
    			}

    			if (dirty & /*address*/ 16 && input3.value !== /*address*/ ctx[4]) {
    				set_input_value(input3, /*address*/ ctx[4]);
    			}

    			if (dirty & /*description*/ 8) {
    				set_input_value(textarea, /*description*/ ctx[3]);
    			}

    			const meetupgrid_changes = {};
    			if (dirty & /*meetups*/ 32) meetupgrid_changes.meetups = /*meetups*/ ctx[5];
    			meetupgrid.$set(meetupgrid_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(header.$$.fragment, local);
    			transition_in(meetupgrid.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(header.$$.fragment, local);
    			transition_out(meetupgrid.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(header, detaching);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(main);
    			destroy_component(meetupgrid);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$3($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("App", slots, []);
    	let title = "";
    	let subtitle = "";
    	let contact = "";
    	let description = "";
    	let address = "";

    	let meetups = [
    		{
    			id: "m1",
    			title: "The first meetup",
    			subtitle: "Yeee",
    			description: "First mmeetup desc",
    			address: "130 avenue de la resistance. 93340. LE RAINCY",
    			contact: "email@test.com"
    		},
    		{
    			id: "m2",
    			title: "The second meetup",
    			subtitle: "Yeee 2",
    			description: "Second mmeetup desc",
    			address: "2 avenue de la resistance. 93340. LE RAINCY",
    			contact: "email2@test.com"
    		}
    	];

    	function addMeetup() {
    		const newMeetup = {
    			id: Math.random().toString(),
    			title,
    			subtitle,
    			description,
    			address,
    			contact
    		};

    		$$invalidate(5, meetups = [...meetups, newMeetup]);
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	function input0_input_handler() {
    		title = this.value;
    		$$invalidate(0, title);
    	}

    	function input1_input_handler() {
    		subtitle = this.value;
    		$$invalidate(1, subtitle);
    	}

    	function input2_input_handler() {
    		contact = this.value;
    		$$invalidate(2, contact);
    	}

    	function input3_input_handler() {
    		address = this.value;
    		$$invalidate(4, address);
    	}

    	function textarea_input_handler() {
    		description = this.value;
    		$$invalidate(3, description);
    	}

    	$$self.$capture_state = () => ({
    		each,
    		prevent_default,
    		MeetupGrid,
    		Header,
    		title,
    		subtitle,
    		contact,
    		description,
    		address,
    		meetups,
    		addMeetup
    	});

    	$$self.$inject_state = $$props => {
    		if ("title" in $$props) $$invalidate(0, title = $$props.title);
    		if ("subtitle" in $$props) $$invalidate(1, subtitle = $$props.subtitle);
    		if ("contact" in $$props) $$invalidate(2, contact = $$props.contact);
    		if ("description" in $$props) $$invalidate(3, description = $$props.description);
    		if ("address" in $$props) $$invalidate(4, address = $$props.address);
    		if ("meetups" in $$props) $$invalidate(5, meetups = $$props.meetups);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		title,
    		subtitle,
    		contact,
    		description,
    		address,
    		meetups,
    		addMeetup,
    		input0_input_handler,
    		input1_input_handler,
    		input2_input_handler,
    		input3_input_handler,
    		textarea_input_handler
    	];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment$3.name
    		});
    	}
    }

    const app = new App({
    	target: document.body
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map
