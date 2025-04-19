/**
 * SmoothScroll.js - A lightweight, high-performance scroll animation library
 * Version 1.0.0
 * 
 * A pure JavaScript scroll animation library with functionality similar to GSAP's ScrollTrigger
 * No dependencies required
 */

class SmoothScroll {
    constructor() {
        // Store all animations
        this.animations = [];
        
        // Store all triggers
        this.triggers = [];
        
        // Animation frame ID
        this.frameId = null;
        
        // Current scroll position
        this.scrollY = window.scrollY || window.pageYOffset;
        this.scrollX = window.scrollX || window.pageXOffset;
        
        // Previous scroll position for velocity calculation
        this.lastScrollY = this.scrollY;
        this.lastScrollX = this.scrollX;
        
        // Scroll velocity
        this.velocityY = 0;
        this.velocityX = 0;
        
        // Default easing functions
        this.easings = {
            linear: t => t,
            easeInQuad: t => t * t,
            easeOutQuad: t => t * (2 - t),
            easeInOutQuad: t => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t,
            easeInCubic: t => t * t * t,
            easeOutCubic: t => (--t) * t * t + 1,
            easeInOutCubic: t => t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1,
            easeInQuart: t => t * t * t * t,
            easeOutQuart: t => 1 - (--t) * t * t * t,
            easeInOutQuart: t => t < 0.5 ? 8 * t * t * t * t : 1 - 8 * (--t) * t * t * t,
            easeInQuint: t => t * t * t * t * t,
            easeOutQuint: t => 1 + (--t) * t * t * t * t,
            easeInOutQuint: t => t < 0.5 ? 16 * t * t * t * t * t : 1 + 16 * (--t) * t * t * t * t,
            easeInExpo: t => t === 0 ? 0 : Math.pow(2, 10 * (t - 1)),
            easeOutExpo: t => t === 1 ? 1 : 1 - Math.pow(2, -10 * t),
            easeInOutExpo: t => t === 0 ? 0 : t === 1 ? 1 : t < 0.5 ? Math.pow(2, 10 * (2 * t - 1)) / 2 : (2 - Math.pow(2, -10 * (2 * t - 1))) / 2,
            easeInElastic: t => t === 0 ? 0 : t === 1 ? 1 : -Math.pow(2, 10 * (t - 1)) * Math.sin((t - 1.1) * 5 * Math.PI),
            easeOutElastic: t => t === 0 ? 0 : t === 1 ? 1 : Math.pow(2, -10 * t) * Math.sin((t - 0.1) * 5 * Math.PI) + 1,
            easeInOutElastic: t => t === 0 ? 0 : t === 1 ? 1 : t < 0.5 ? -(Math.pow(2, 10 * (2 * t - 1)) * Math.sin((2 * t - 1.1) * 5 * Math.PI)) / 2 : Math.pow(2, -10 * (2 * t - 1)) * Math.sin((2 * t - 1.1) * 5 * Math.PI) / 2 + 1,
        };
        
        // Initialize
        this.init();
    }
    
    /**
     * Initialize the SmoothScroll instance
     */
    init() {
        // Bind scroll and resize event handlers
        this.bindEvents();
        
        // Start the animation loop
        this.startLoop();
    }
    
    /**
     * Bind necessary event listeners
     */
    bindEvents() {
        // Use passive event listener for better performance
        window.addEventListener('scroll', this.handleScroll.bind(this), { passive: true });
        
        // Handle window resize
        window.addEventListener('resize', this.handleResize.bind(this));
        
        // Handle device orientation change
        window.addEventListener('orientationchange', this.handleResize.bind(this));
    }
    
    /**
     * Handle scroll events
     */
    handleScroll() {
        // Update scroll position
        this.scrollY = window.scrollY || window.pageYOffset;
        this.scrollX = window.scrollX || window.pageXOffset;
    }
    
    /**
     * Handle resize events
     */
    handleResize() {
        // Recalculate dimensions and positions of all triggers
        this.updateTriggerPositions();
    }
    
    /**
     * Update trigger positions when elements resize
     */
    updateTriggerPositions() {
        this.triggers.forEach(trigger => {
            if (trigger.element) {
                const rect = trigger.element.getBoundingClientRect();
                trigger.top = rect.top + this.scrollY;
                trigger.bottom = rect.bottom + this.scrollY;
                trigger.left = rect.left + this.scrollX;
                trigger.right = rect.right + this.scrollX;
                trigger.height = rect.height;
                trigger.width = rect.width;
            }
        });
    }
    
    /**
     * Start the animation loop
     */
    startLoop() {
        if (this.frameId) {
            cancelAnimationFrame(this.frameId);
        }
        
        const loop = () => {
            // Calculate velocity
            this.velocityY = this.scrollY - this.lastScrollY;
            this.velocityX = this.scrollX - this.lastScrollX;
            
            // Store current scroll position for next frame
            this.lastScrollY = this.scrollY;
            this.lastScrollX = this.scrollX;
            
            // Process animations
            this.update();
            
            // Continue loop
            this.frameId = requestAnimationFrame(loop);
        };
        
        // Start the loop
        this.frameId = requestAnimationFrame(loop);
    }
    
    /**
     * Stop the animation loop
     */
    stopLoop() {
        if (this.frameId) {
            cancelAnimationFrame(this.frameId);
            this.frameId = null;
        }
    }
    
    /**
     * Update all animations and triggers
     */
    update() {
        // Update all scroll triggers
        this.updateTriggers();
        
        // Update all animations
        this.updateAnimations();
    }
    
    /**
     * Update all trigger states
     */
    updateTriggers() {
        this.triggers.forEach(trigger => {
            const progress = this.calculateTriggerProgress(trigger);
            
            // Update trigger progress
            trigger.progress = progress;
            
            // Determine if trigger is active
            const wasActive = trigger.isActive;
            trigger.isActive = progress > 0 && progress < 1;
            
            // Handle callbacks
            if (!wasActive && trigger.isActive && trigger.onEnter) {
                trigger.onEnter(trigger);
            } else if (wasActive && !trigger.isActive) {
                if (progress <= 0 && trigger.onLeaveBack) {
                    trigger.onLeaveBack(trigger);
                } else if (progress >= 1 && trigger.onLeave) {
                    trigger.onLeave(trigger);
                }
            }
            
            // Update callback
            if (trigger.isActive && trigger.onUpdate) {
                trigger.onUpdate(trigger);
            }
        });
    }
    
    /**
     * Calculate progress for a trigger
     */
    calculateTriggerProgress(trigger) {
        let progress;
        
        if (trigger.type === 'scroll') {
            // For scroll triggers, calculate progress based on scroll position
            const start = trigger.start;
            const end = trigger.end;
            
            progress = (this.scrollY - start) / (end - start);
        } else if (trigger.element) {
            // For element triggers, calculate progress based on element visibility
            const windowHeight = window.innerHeight;
            const elementTop = trigger.top;
            const elementBottom = trigger.bottom;
            
            const start = elementTop - windowHeight * (1 - trigger.startTrigger);
            const end = elementBottom - windowHeight * trigger.endTrigger;
            
            progress = (this.scrollY - start) / (end - start);
        }
        
        // Clamp progress between 0 and 1
        return Math.max(0, Math.min(1, progress));
    }
    
    /**
     * Update all animations
     */
    updateAnimations() {
        this.animations.forEach(animation => {
            // Skip inactive animations
            if (!animation.isActive) return;
            
            // Get progress from linked trigger if available
            let progress = animation.trigger ? animation.trigger.progress : null;
            
            // Apply custom timing function if provided
            if (progress !== null && animation.timing) {
                progress = typeof animation.timing === 'function' ? 
                    animation.timing(progress) : 
                    this.easings[animation.timing](progress);
            }
            
            // Apply the animation based on progress
            if (progress !== null) {
                this.applyAnimation(animation, progress);
            }
        });
    }
    
    /**
     * Apply animation with given progress
     */
    applyAnimation(animation, progress) {
        const { element, properties } = animation;
        
        if (!element) return;
        
        // Apply each property based on the progress
        Object.entries(properties).forEach(([prop, config]) => {
            let value;
            
            // Calculate the current value based on progress
            if (Array.isArray(config.value)) {
                // Array of values for keyframe animation
                const keyframes = config.value;
                const segments = keyframes.length - 1;
                const segmentSize = 1 / segments;
                
                // Find which segment we're in
                const segmentIndex = Math.min(segments - 1, Math.floor(progress / segmentSize));
                const segmentProgress = (progress - segmentIndex * segmentSize) / segmentSize;
                
                // Interpolate between the two keyframes
                const start = keyframes[segmentIndex];
                const end = keyframes[segmentIndex + 1];
                
                value = this.interpolate(start, end, segmentProgress);
            } else {
                // Simple from-to animation
                const from = config.from !== undefined ? config.from : 0;
                const to = config.to !== undefined ? config.to : config.value;
                
                value = this.interpolate(from, to, progress);
            }
            
            // Apply the value with proper units
            this.applyProperty(element, prop, value, config.unit || '');
        });
        
        // Apply any custom function
        if (animation.onUpdate) {
            animation.onUpdate(progress, element);
        }
    }
    
    /**
     * Apply a property to an element
     */
    applyProperty(element, property, value, unit) {
        if (property === 'transform') {
            // Transform properties are special case
            let existing = element.style.transform || '';
            
            // Add or update transform with the new value
            if (existing.includes(`${value.property}(`)) {
                existing = existing.replace(new RegExp(`${value.property}\\([^\\)]+\\)`), `${value.property}(${value.value}${unit})`);
            } else {
                existing += ` ${value.property}(${value.value}${unit})`;
            }
            
            element.style.transform = existing.trim();
        } else if (property.startsWith('--')) {
            // CSS custom property
            element.style.setProperty(property, `${value}${unit}`);
        } else if (property in element.style) {
            // Standard CSS property
            element.style[property] = `${value}${unit}`;
        } else if (property in element) {
            // Direct property on the element
            element[property] = value;
        }
    }
    
    /**
     * Interpolate between two values
     */
    interpolate(start, end, progress) {
        if (typeof start === 'object' && start !== null && typeof end === 'object' && end !== null) {
            // Handle objects (like transform properties)
            const result = { ...start };
            
            for (const key in result) {
                if (key in end) {
                    result[key] = this.interpolate(start[key], end[key], progress);
                }
            }
            
            return result;
        } else if (typeof start === 'string' && typeof end === 'string') {
            // Handle color interpolation
            if (start.startsWith('#') && end.startsWith('#')) {
                return this.interpolateColor(start, end, progress);
            }
            
            // Convert strings to numbers if possible
            const startNum = parseFloat(start);
            const endNum = parseFloat(end);
            
            if (!isNaN(startNum) && !isNaN(endNum)) {
                return startNum + (endNum - startNum) * progress;
            }
            
            // If strings cannot be converted to numbers, return based on progress threshold
            return progress < 0.5 ? start : end;
        } else if (typeof start === 'number' && typeof end === 'number') {
            // Simple numeric interpolation
            return start + (end - start) * progress;
        }
        
        // Default fallback
        return progress < 0.5 ? start : end;
    }
    
    /**
     * Interpolate between two colors
     */
    interpolateColor(startColor, endColor, progress) {
        // Convert hex to RGB
        const start = this.hexToRgb(startColor);
        const end = this.hexToRgb(endColor);
        
        if (!start || !end) return startColor;
        
        // Interpolate each channel
        const r = Math.round(start.r + (end.r - start.r) * progress);
        const g = Math.round(start.g + (end.g - start.g) * progress);
        const b = Math.round(start.b + (end.b - start.b) * progress);
        
        // Convert back to hex
        return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
    }
    
    /**
     * Convert hex color to RGB
     */
    hexToRgb(hex) {
        const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
        hex = hex.replace(shorthandRegex, (m, r, g, b) => r + r + g + g + b + b);
        
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    }
    
    /**
     * Create a scroll trigger
     */
    createTrigger(options) {
        const defaultOptions = {
            type: 'element',       // 'element' or 'scroll'
            element: null,         // Target element for 'element' type
            start: 0,              // Start position for 'scroll' type
            end: 0,                // End position for 'scroll' type
            startTrigger: 0.8,     // Position to trigger when element enters viewport (0 = top, 1 = bottom)
            endTrigger: 0.2,       // Position where trigger ends (0 = top, 1 = bottom)
            onEnter: null,         // Callback when trigger becomes active
            onLeave: null,         // Callback when trigger becomes inactive (scrolled past)
            onLeaveBack: null,     // Callback when trigger becomes inactive (scrolled back)
            onUpdate: null,        // Callback on each update
            isActive: false,       // Whether trigger is currently active
            progress: 0            // Current progress (0-1)
        };
        
        // Merge options with defaults
        const trigger = { ...defaultOptions, ...options };
        
        // Calculate positions for element triggers
        if (trigger.type === 'element' && trigger.element) {
            const rect = trigger.element.getBoundingClientRect();
            trigger.top = rect.top + this.scrollY;
            trigger.bottom = rect.bottom + this.scrollY;
            trigger.left = rect.left + this.scrollX;
            trigger.right = rect.right + this.scrollX;
            trigger.height = rect.height;
            trigger.width = rect.width;
        }
        
        // Add to triggers collection
        this.triggers.push(trigger);
        
        return trigger;
    }
    
    /**
     * Create a scroll animation
     */
    createAnimation(options) {
        const defaultOptions = {
            element: null,         // Target element
            trigger: null,         // Linked trigger
            properties: {},        // Properties to animate
            timing: 'linear',      // Timing function
            onUpdate: null,        // Custom update function
            isActive: true         // Whether animation is active
        };
        
        // Merge options with defaults
        const animation = { ...defaultOptions, ...options };
        
        // Add to animations collection
        this.animations.push(animation);
        
        return animation;
    }
    
    /**
     * Create a scroll scene (combination of trigger and animation)
     */
    createScene(options) {
        const {
            trigger: triggerOptions,
            animation: animationOptions,
            ...commonOptions
        } = options;
        
        // Create trigger
        const trigger = this.createTrigger({
            ...commonOptions,
            ...triggerOptions
        });
        
        // Create animation linked to the trigger
        const animation = this.createAnimation({
            ...commonOptions,
            ...animationOptions,
            trigger
        });
        
        return {
            trigger,
            animation
        };
    }
    
    /**
     * Create a pinning effect
     */
    pin(element, options = {}) {
        const defaultOptions = {
            startPosition: 0,      // Start position relative to viewport
            duration: '100%',      // Duration (can be px or % of viewport)
            pushFollowers: true,   // Whether to push content below
            anticipatePin: 0,      // Prepare pin this amount of px before
            end: null,             // Custom end position
            horizontal: false,     // Pin horizontally instead of vertically
            pinReparent: false     // Whether to reparent the element while pinned
        };
        
        // Merge options with defaults
        const pinOptions = { ...defaultOptions, ...options };
        
        // Get element dimensions
        const rect = element.getBoundingClientRect();
        const parentRect = element.offsetParent.getBoundingClientRect();
        
        // Calculate positions
        const start = this.scrollY + rect.top - pinOptions.startPosition;
        
        // Parse duration
        let duration;
        if (typeof pinOptions.duration === 'string' && pinOptions.duration.endsWith('%')) {
            const percent = parseFloat(pinOptions.duration) / 100;
            duration = window.innerHeight * percent;
        } else {
            duration = parseFloat(pinOptions.duration);
        }
        
        // Calculate end
        const end = pinOptions.end !== null ? pinOptions.end : start + duration;
        
        // Create spacer element
        const spacer = document.createElement('div');
        spacer.style.width = `${rect.width}px`;
        spacer.style.height = `${rect.height}px`;
        spacer.className = 'smoothscroll-pin-spacer';
        
        // Insert spacer
        element.parentNode.insertBefore(spacer, element);
        
        // Set up element for pinning
        const originalStyles = {
            position: element.style.position,
            top: element.style.top,
            left: element.style.left,
            width: element.style.width,
            zIndex: element.style.zIndex
        };
        
        // Prepare pinned style
        const pinnedStyles = {
            position: 'fixed',
            top: `${rect.top}px`,
            left: `${rect.left}px`,
            width: `${rect.width}px`,
            zIndex: '999'
        };
        
        // Create trigger
        const trigger = this.createTrigger({
            type: 'scroll',
            start,
            end,
            onEnter: () => {
                // Apply pinned styles
                Object.assign(element.style, pinnedStyles);
                
                // Reparent if needed
                if (pinOptions.pinReparent) {
                    document.body.appendChild(element);
                }
            },
            onLeave: () => {
                // When scrolled past, position at the bottom of the range
                element.style.position = 'absolute';
                element.style.top = `${end - start}px`;
                element.style.left = '0';
                
                // Return to original parent if needed
                if (pinOptions.pinReparent) {
                    spacer.parentNode.insertBefore(element, spacer.nextSibling);
                }
            },
            onLeaveBack: () => {
                // Restore original styles
                Object.assign(element.style, originalStyles);
                
                // Return to original parent if needed
                if (pinOptions.pinReparent) {
                    spacer.parentNode.insertBefore(element, spacer.nextSibling);
                }
            },
            onUpdate: (trigger) => {
                // Update follower elements if needed
                if (pinOptions.pushFollowers && trigger.isActive) {
                    // Calculate how much to push down followers
                    const pushDistance = Math.min(duration, (this.scrollY - start));
                    
                    if (pinOptions.horizontal) {
                        spacer.style.marginLeft = `${pushDistance}px`;
                    } else {
                        spacer.style.marginTop = `${pushDistance}px`;
                    }
                }
            }
        });
        
        return trigger;
    }
    
    /**
     * Create a parallax effect
     */
    parallax(element, options = {}) {
        const defaultOptions = {
            speed: 0.5,            // Parallax speed (-1 to 1, negative values move in opposite direction)
            direction: 'vertical', // 'vertical' or 'horizontal'
            startPosition: 'center', // 'top', 'center', 'bottom' for vertical; 'left', 'center', 'right' for horizontal
            layers: null,          // DOM elements to use as layers (with data-depth attribute)
            container: null        // Container to use for positioning context
        };
        
        // Merge options with defaults
        const parallaxOptions = { ...defaultOptions, ...options };
        
        // Get element dimensions
        const rect = element.getBoundingClientRect();
        
        // Create container if needed
        const container = parallaxOptions.container || element;
        
        // Get or set layers
        const layers = parallaxOptions.layers || 
                      Array.from(element.querySelectorAll('[data-depth]'));
        
        // Create trigger for the parallax effect
        const trigger = this.createTrigger({
            type: 'element',
            element: container,
            startTrigger: 1,       // Start when element enters viewport
            endTrigger: 0,         // End when element leaves viewport
            onUpdate: (trigger) => {
                // Calculate the parallax offset
                const windowHeight = window.innerHeight;
                const windowWidth = window.innerWidth;
                
                // Element position relative to viewport center
                const rect = container.getBoundingClientRect();
                let positionFactor;
                
                if (parallaxOptions.direction === 'vertical') {
                    const startOffset = {
                        'top': 0,
                        'center': windowHeight / 2,
                        'bottom': windowHeight
                    }[parallaxOptions.startPosition] || (windowHeight / 2);
                    
                    positionFactor = (rect.top - startOffset) / windowHeight;
                } else {
                    const startOffset = {
                        'left': 0,
                        'center': windowWidth / 2,
                        'right': windowWidth
                    }[parallaxOptions.startPosition] || (windowWidth / 2);
                    
                    positionFactor = (rect.left - startOffset) / windowWidth;
                }
                
                // Apply to each layer
                layers.forEach(layer => {
                    const depth = parseFloat(layer.dataset.depth || parallaxOptions.speed);
                    const offset = positionFactor * depth * 100; // in pixels
                    
                    if (parallaxOptions.direction === 'vertical') {
                        layer.style.transform = `translateY(${offset}px)`;
                    } else {
                        layer.style.transform = `translateX(${offset}px)`;
                    }
                });
            }
        });
        
        return trigger;
    }
    
    /**
     * Create a scroll-based timeline
     */
    timeline(options = {}) {
        const defaultOptions = {
            trigger: null,         // Trigger element or options
            start: 0,              // Start position
            end: '100%',           // End position
            scrub: false,          // Whether to scrub the timeline with scroll
            scrubSmoothness: 0.5,  // Smoothness of scrubbing (0 = no smoothing)
            pin: false,            // Element to pin during the timeline
            pinOptions: {},        // Options for pinning
            markers: false         // Show timeline markers (for debugging)
        };
        
        // Merge options with defaults
        const timelineOptions = { ...defaultOptions, ...options };
        
        // Timeline items
        const items = [];
        
        // Create trigger if not provided
        const trigger = timelineOptions.trigger instanceof Object && !(timelineOptions.trigger instanceof Element) ?
            this.createTrigger(timelineOptions.trigger) :
            this.createTrigger({
                type: timelineOptions.trigger ? 'element' : 'scroll',
                element: timelineOptions.trigger || null,
                start: timelineOptions.start,
                end: timelineOptions.end
            });
        
        // Create pin if requested
        let pinTrigger = null;
        if (timelineOptions.pin) {
            pinTrigger = this.pin(
                typeof timelineOptions.pin === 'boolean' ? 
                    timelineOptions.trigger : 
                    timelineOptions.pin,
                timelineOptions.pinOptions
            );
        }
        
        // Create markers if requested
        if (timelineOptions.markers) {
            this.createMarkers(trigger);
        }
        
        // Current progress for scrubbing
        let currentProgress = 0;
        
        // Update function for scrubbing
        if (timelineOptions.scrub) {
            trigger.onUpdate = (trig) => {
                // Apply smoothing if needed
                if (timelineOptions.scrubSmoothness > 0) {
                    currentProgress += (trig.progress - currentProgress) * 
                                       (1 - timelineOptions.scrubSmoothness);
                } else {
                    currentProgress = trig.progress;
                }
                
                // Update timeline items
                items.forEach(item => {
                    // Calculate item-specific progress
                    let itemProgress = (currentProgress - item.position) / item.duration;
                    itemProgress = Math.max(0, Math.min(1, itemProgress));
                    
                    // Apply easing if specified
                    if (item.easing) {
                        itemProgress = typeof item.easing === 'function' ?
                            item.easing(itemProgress) :
                            this.easings[item.easing](itemProgress);
                    }
                    
                    // Update the animation
                    this.applyAnimation(item.animation, itemProgress);
                });
            };
        }
        
        // Timeline methods
        const timeline = {
            trigger,
            pinTrigger,
            items,
            
            /**
             * Add a new animation to the timeline
             */
            add: (element, properties, position = 0, duration = 0.5, easing = 'linear') => {
                // Create animation object
                const animation = {
                    element,
                    properties,
                    isActive: true
                };
                
                // Add to items
                items.push({
                    animation,
                    position,
                    duration,
                    easing
                });
                
                return timeline;
            },
            
            /**
             * Chain animations with automatic positioning
             */
            from: (element, properties, position = '+=0', duration = 0.5, easing = 'linear') => {
                // Calculate position
                let pos = 0;
                
                if (typeof position === 'string') {
                    if (position.startsWith('+=')) {
                        // Relative to the end of the last item
                        const lastItem = items[items.length - 1];
                        pos = lastItem ? 
                            lastItem.position + lastItem.duration : 
                            0;
                        pos += parseFloat(position.substring(2)) || 0;
                    } else if (position.startsWith('-=')) {
                        // Relative backwards from the end of the last item
                        const lastItem = items[items.length - 1];
                        pos = lastItem ? 
                            lastItem.position + lastItem.duration : 
                            0;
                        pos -= parseFloat(position.substring(2)) || 0;
                    } else {
                        // Absolute position
                        pos = parseFloat(position) || 0;
                    }
                } else {
                    pos = position;
                }
                
                // Add the animation
                return timeline.add(element, properties, pos, duration, easing);
            },
            
            /**
             * Add animation relative to the previous one
             */
            to: (element, properties, duration = 0.5, easing = 'linear') => {
                return timeline.from(element, properties, '+=0', duration, easing);
            },
            
            /**
             * Create a labeled position in the timeline
             */
            addLabel: (label, position = '+=0') => {
                // Calculate position
                let pos = 0;
                
                if (typeof position === 'string') {
                    if (position.startsWith('+=')) {
                        // Relative to the end of the last item
                        const lastItem = items[items.length - 1];
                        pos = lastItem ? 
                            lastItem.position + lastItem.duration : 
                            0;
                        pos += parseFloat(position.substring(2)) || 0;
                    } else if (position.startsWith('-=')) {
                        // Relative backwards from the end of the last item
                        const lastItem = items[items.length - 1];
                        pos = lastItem ? 
                            lastItem.position + lastItem.duration : 
                            0;
                        pos -= parseFloat(position.substring(2))
                    } else {
                        // Absolute position
                        pos = parseFloat(position) || 0;
                    }
                } else {
                    pos = position;
                }
                
                // Store the label position
                timeline.labels = timeline.labels || {};
                timeline.labels[label] = pos;
                
                return timeline;
            },
            
            /**
             * Play the timeline independently of scroll
             */
            play: (duration = 1000, callbacks = {}) => {
                const startTime = performance.now();
                const { onComplete, onUpdate, ease = 'linear' } = callbacks;
                
                // Set up animation frame
                const animate = (time) => {
                    const elapsed = time - startTime;
                    let progress = Math.min(1, elapsed / duration);
                    
                    // Apply easing
                    const easedProgress = this.easings[ease] ? 
                        this.easings[ease](progress) : 
                        progress;
                    
                    // Update timeline items
                    items.forEach(item => {
                        // Calculate item-specific progress
                        let itemProgress = (easedProgress - item.position) / item.duration;
                        itemProgress = Math.max(0, Math.min(1, itemProgress));
                        
                        // Apply easing if specified
                        if (item.easing) {
                            itemProgress = typeof item.easing === 'function' ?
                                item.easing(itemProgress) :
                                this.easings[item.easing](itemProgress);
                        }
                        
                        // Update the animation
                        this.applyAnimation(item.animation, itemProgress);
                    });
                    
                    // Call onUpdate callback
                    if (onUpdate) {
                        onUpdate(progress);
                    }
                    
                    // Continue or complete
                    if (progress < 1) {
                        requestAnimationFrame(animate);
                    } else if (onComplete) {
                        onComplete();
                    }
                };
                
                // Start animation
                requestAnimationFrame(animate);
                
                return timeline;
            },
            
            /**
             * Seek to a specific position in the timeline
             */
            seek: (position) => {
                // If position is a label name, use its position
                if (typeof position === 'string' && timeline.labels && timeline.labels[position] !== undefined) {
                    position = timeline.labels[position];
                }
                
                // Convert to numeric position
                const progress = parseFloat(position);
                
                // Update timeline items
                items.forEach(item => {
                    // Calculate item-specific progress
                    let itemProgress = (progress - item.position) / item.duration;
                    itemProgress = Math.max(0, Math.min(1, itemProgress));
                    
                    // Apply easing if specified
                    if (item.easing) {
                        itemProgress = typeof item.easing === 'function' ?
                            item.easing(itemProgress) :
                            this.easings[item.easing](itemProgress);
                    }
                    
                    // Update the animation
                    this.applyAnimation(item.animation, itemProgress);
                });
                
                return timeline;
            }
        };
        
        return timeline;
    }
    
    /**
     * Create timeline markers for debugging
     */
    createMarkers(trigger) {
        // Create markers container if it doesn't exist
        let markersContainer = document.getElementById('smoothscroll-markers');
        if (!markersContainer) {
            markersContainer = document.createElement('div');
            markersContainer.id = 'smoothscroll-markers';
            markersContainer.style.cssText = `
                position: fixed;
                top: 0;
                right: 0;
                z-index: 9999;
                pointer-events: none;
            `;
            document.body.appendChild(markersContainer);
        }
        
        // Create marker for this trigger
        const marker = document.createElement('div');
        marker.className = 'smoothscroll-marker';
        marker.style.cssText = `
            position: absolute;
            right: 10px;
            width: 10px;
            height: 10px;
            border-radius: 50%;
            background-color: rgba(255, 0, 0, 0.5);
        `;
        markersContainer.appendChild(marker);
        
        // Create start and end markers
        const startMarker = document.createElement('div');
        startMarker.className = 'smoothscroll-start-marker';
        startMarker.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 2px;
            background-color: green;
            pointer-events: none;
        `;
        document.body.appendChild(startMarker);
        
        const endMarker = document.createElement('div');
        endMarker.className = 'smoothscroll-end-marker';
        endMarker.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 2px;
            background-color: red;
            pointer-events: none;
        `;
        document.body.appendChild(endMarker);
        
        // Update markers on scroll
        const updateMarker = () => {
            // Get trigger positions
            const { progress, top, bottom } = trigger;
            
            // Update progress marker
            marker.style.top = `${window.innerHeight * progress}px`;
            marker.style.backgroundColor = progress > 0 && progress < 1 ?
                'rgba(0, 255, 0, 0.75)' :
                'rgba(255, 0, 0, 0.5)';
            
            // Update start and end markers
            if (trigger.type === 'element' && trigger.element) {
                startMarker.style.top = `${top - window.scrollY}px`;
                endMarker.style.top = `${bottom - window.scrollY}px`;
            } else if (trigger.type === 'scroll') {
                startMarker.style.top = `${trigger.start - window.scrollY}px`;
                endMarker.style.top = `${trigger.end - window.scrollY}px`;
            }
        };
        
        // Update on scroll
        window.addEventListener('scroll', updateMarker);
        
        // Initial update
        updateMarker();
        
        return {
            destroy: () => {
                markersContainer.removeChild(marker);
                document.body.removeChild(startMarker);
                document.body.removeChild(endMarker);
                window.removeEventListener('scroll', updateMarker);
            }
        };
    }
    
    /**
     * Create a smooth scroll to element function
     */
    scrollTo(target, options = {}) {
        const defaultOptions = {
            duration: 1000,        // Duration in ms
            offset: 0,             // Offset in px
            easing: 'easeInOutQuad', // Easing function
            onComplete: null,      // Callback on complete
            onCancel: null,        // Callback on cancel
            onUpdate: null         // Callback on update
        };
        
        // Merge options with defaults
        const scrollOptions = { ...defaultOptions, ...options };
        
        // Get target position
        let targetPosition;
        
        if (typeof target === 'number') {
            // Numeric position
            targetPosition = target;
        } else if (typeof target === 'string') {
            // CSS selector
            const element = document.querySelector(target);
            if (!element) return;
            targetPosition = element.getBoundingClientRect().top + window.scrollY;
        } else if (target instanceof Element) {
            // DOM element
            targetPosition = target.getBoundingClientRect().top + window.scrollY;
        } else {
            return;
        }
        
        // Add offset
        targetPosition += scrollOptions.offset;
        
        // Get start position
        const startPosition = window.scrollY || window.pageYOffset;
        const distance = targetPosition - startPosition;
        
        // Store animation state
        let animationFrame = null;
        let startTime = null;
        
        // Animation function
        const animate = (timestamp) => {
            if (!startTime) startTime = timestamp;
            
            const elapsed = timestamp - startTime;
            const progress = Math.min(elapsed / scrollOptions.duration, 1);
            
            // Apply easing
            const easedProgress = typeof scrollOptions.easing === 'function' ?
                scrollOptions.easing(progress) :
                this.easings[scrollOptions.easing](progress);
            
            // Update scroll position
            const currentPosition = startPosition + distance * easedProgress;
            window.scrollTo(0, currentPosition);
            
            // Call onUpdate callback
            if (scrollOptions.onUpdate) {
                scrollOptions.onUpdate(progress, currentPosition);
            }
            
            // Continue or complete
            if (progress < 1) {
                animationFrame = requestAnimationFrame(animate);
            } else if (scrollOptions.onComplete) {
                scrollOptions.onComplete();
            }
        };
        
        // Start animation
        animationFrame = requestAnimationFrame(animate);
        
        // Return controller
        return {
            cancel: () => {
                if (animationFrame) {
                    cancelAnimationFrame(animationFrame);
                    animationFrame = null;
                    
                    if (scrollOptions.onCancel) {
                        scrollOptions.onCancel();
                    }
                }
            }
        };
    }
    
    /**
     * Create a horizontally scrolling gallery
     */
    horizontalScroll(element, options = {}) {
        const defaultOptions = {
            trigger: element,      // Element to use as trigger
            pin: element,          // Element to pin
            pinSpacing: true,      // Whether to create spacer
            anticipatePin: 0,      // Prepare pin this amount of px before
            start: 'top top',      // Start position
            end: '+=100%',         // End position 
            scrub: true,           // Whether to scrub with scroll
            snap: false,           // Whether to snap to sections
            snapSpeed: 0.3,        // Speed of snapping
            onUpdate: null         // Callback on update
        };
        
        // Merge options with defaults
        const horizontalOptions = { ...defaultOptions, ...options };
        
        // Get scrollable content
        const content = element.querySelector('[data-horizontal-content]') || element.firstElementChild;
        
        // Calculate width
        const contentWidth = content.scrollWidth;
        const containerWidth = element.clientWidth;
        const scrollDistance = contentWidth - containerWidth;
        
        // Set up container
        element.style.overflow = 'hidden';
        
        // Set up content for horizontal scrolling
        content.style.position = 'relative';
        content.style.display = 'inline-flex';
        content.style.willChange = 'transform';
        
        // Parse start and end positions
        const parsePosition = (posString, isStart) => {
            if (typeof posString === 'number') return posString;
            
            // Handle special syntax
            if (posString.startsWith('+=')) {
                const base = isStart ? element.getBoundingClientRect().top + window.scrollY : null;
                return base + parseFloat(posString.substring(2));
            } else if (posString.includes(' ')) {
                const [elementPos, viewportPos] = posString.split(' ');
                const rect = element.getBoundingClientRect();
                
                // Element position
                let elementOffset = 0;
                if (elementPos === 'top') elementOffset = rect.top;
                else if (elementPos === 'center') elementOffset = rect.top + rect.height / 2;
                else if (elementPos === 'bottom') elementOffset = rect.bottom;
                else elementOffset = rect.top + parseFloat(elementPos);
                
                // Viewport position
                let viewportOffset = 0;
                if (viewportPos === 'top') viewportOffset = 0;
                else if (viewportPos === 'center') viewportOffset = window.innerHeight / 2;
                else if (viewportPos === 'bottom') viewportOffset = window.innerHeight;
                else viewportOffset = parseFloat(viewportPos);
                
                return window.scrollY + elementOffset - viewportOffset;
            }
            
            return parseFloat(posString) || 0;
        };
        
        // Calculate start and end
        const start = parsePosition(horizontalOptions.start, true);
        const end = horizontalOptions.end.startsWith('+=') ?
            start + parseFloat(horizontalOptions.end.substring(2)) :
            parsePosition(horizontalOptions.end, false);
        
        // Pin the element
        const pinTrigger = this.pin(horizontalOptions.pin, {
            startPosition: start - window.scrollY,
            duration: end - start,
            horizontal: true,
            anticipatePin: horizontalOptions.anticipatePin,
            pushFollowers: horizontalOptions.pinSpacing
        });
        
        // Create scroll trigger
        const scrollTrigger = this.createTrigger({
            type: 'scroll',
            start,
            end,
            onUpdate: (trigger) => {
                // Calculate progress
                const { progress } = trigger;
                
                // Apply horizontal transform
                content.style.transform = `translateX(-${progress * scrollDistance}px)`;
                
                // Call callback if provided
                if (horizontalOptions.onUpdate) {
                    horizontalOptions.onUpdate(trigger);
                }
            }
        });
        
        // Add snapping if requested
        if (horizontalOptions.snap) {
            // Get or find sections
            const sections = Array.from(content.querySelectorAll('[data-section]'));
            const sectionCount = sections.length || Math.ceil(contentWidth / containerWidth);
            
            // Create snap points if no sections
            const snapPoints = sections.length ? 
                sections.map(section => {
                    const rect = section.getBoundingClientRect();
                    return rect.left - content.getBoundingClientRect().left;
                }) : 
                Array.from({ length: sectionCount }, (_, i) => 
                    (contentWidth / sectionCount) * i
                );
            
            // Add snap functionality
            let isSnapping = false;
            let lastProgress = 0;
            
            // Function to find closest snap point
            const findClosestSnapPoint = (scrollProgress) => {
                const scrollPos = scrollProgress * scrollDistance;
                let closest = 0;
                let minDistance = Infinity;
                
                snapPoints.forEach((point, index) => {
                    const distance = Math.abs(point - scrollPos);
                    if (distance < minDistance) {
                        minDistance = distance;
                        closest = point;
                    }
                });
                
                return closest / scrollDistance;
            };
            
            // Override the onUpdate function
            const originalOnUpdate = scrollTrigger.onUpdate;
            scrollTrigger.onUpdate = (trigger) => {
                // Only snap when not actively scrolling
                if (!isSnapping) {
                    lastProgress = trigger.progress;
                    
                    if (Math.abs(this.velocityY) < 0.1) {
                        // Scroll has almost stopped, snap
                        const targetProgress = findClosestSnapPoint(trigger.progress);
                        
                        if (Math.abs(targetProgress - trigger.progress) > 0.01) {
                            isSnapping = true;
                            
                            // Calculate scroll position
                            const startScrollPos = window.scrollY;
                            const targetScrollPos = start + (end - start) * targetProgress;
                            const distance = targetScrollPos - startScrollPos;
                            
                            // Animate to snap point
                            this.scrollTo(targetScrollPos, {
                                duration: Math.abs(distance) * horizontalOptions.snapSpeed,
                                easing: 'easeOutQuad',
                                onUpdate: (p, pos) => {
                                    // Update progress during animation
                                    const animProgress = lastProgress + (targetProgress - lastProgress) * p;
                                    content.style.transform = `translateX(-${animProgress * scrollDistance}px)`;
                                },
                                onComplete: () => {
                                    isSnapping = false;
                                },
                                onCancel: () => {
                                    isSnapping = false;
                                }
                            });
                            
                            return;
                        }
                    }
                }
                
                // Call original update
                originalOnUpdate(trigger);
            };
        }
        
        return {
            trigger: scrollTrigger,
            pinTrigger,
            content,
            scrollTo: (target) => {
                let targetProgress;
                
                if (typeof target === 'number') {
                    // Direct progress value (0-1)
                    targetProgress = Math.max(0, Math.min(1, target));
                } else if (typeof target === 'string') {
                    // Find section by selector
                    const section = content.querySelector(target);
                    if (!section) return;
                    
                    const rect = section.getBoundingClientRect();
                    const contentRect = content.getBoundingClientRect();
                    targetProgress = (rect.left - contentRect.left) / scrollDistance;
                } else if (target instanceof Element) {
                    // DOM element
                    const rect = target.getBoundingClientRect();
                    const contentRect = content.getBoundingClientRect();
                    targetProgress = (rect.left - contentRect.left) / scrollDistance;
                }
                
                // Calculate scroll position
                const targetScrollPos = start + (end - start) * targetProgress;
                
                // Scroll to position
                this.scrollTo(targetScrollPos, {
                    duration: 1000,
                    easing: 'easeInOutQuad'
                });
            }
        };
    }
    
    /**
     * Create a scroll-triggered reveal animation
     */
    reveal(elements, options = {}) {
        const defaultOptions = {
            origin: 'bottom',      // 'top', 'bottom', 'left', 'right'
            distance: '20px',      // Distance to animate
            duration: 600,         // Animation duration in ms
            delay: 0,              // Delay before animation in ms
            interval: 0,           // Interval between animations in ms
            scale: 1,              // Scale factor (0.9 = 90%)
            opacity: 0,            // Starting opacity
            easing: 'easeOutCubic', // Easing function
            desktop: true,         // Enable on desktop
            mobile: true,          // Enable on mobile
            once: false,           // Only animate once
            reset: false,          // Reset animation when element leaves viewport
            stagger: true          // Stagger animations
        };
        
        // Merge options with defaults
        const revealOptions = { ...defaultOptions, ...options };
        
        // Convert to array if necessary
        const elementList = Array.isArray(elements) ? 
            elements : 
            (typeof elements === 'string' ? 
                Array.from(document.querySelectorAll(elements)) : 
                [elements]);
        
        // Check if mobile device
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        
        // Skip if disabled for this device
        if ((isMobile && !revealOptions.mobile) || (!isMobile && !revealOptions.desktop)) {
            return;
        }
        
        // Create triggers for each element
        const triggers = elementList.map((element, index) => {
            // Set initial styles
            element.style.opacity = revealOptions.opacity;
            element.style.transition = `opacity ${revealOptions.duration}ms ${revealOptions.easing}, transform ${revealOptions.duration}ms ${revealOptions.easing}`;
            element.style.willChange = 'opacity, transform';
            
            // Set initial transform
            let transform = `scale(${revealOptions.scale})`;
            
            // Add translation based on origin
            const distance = revealOptions.distance;
            
            switch (revealOptions.origin) {
                case 'top':
                    transform += ` translateY(-${distance})`;
                    break;
                case 'bottom':
                    transform += ` translateY(${distance})`;
                    break;
                case 'left':
                    transform += ` translateX(-${distance})`;
                    break;
                case 'right':
                    transform += ` translateX(${distance})`;
                    break;
            }
            
            element.style.transform = transform;
            
            // Calculate delay with staggering if enabled
            const delay = revealOptions.delay + 
                (revealOptions.stagger ? index * revealOptions.interval : 0);
            
            // Create trigger
            const trigger = this.createTrigger({
                type: 'element',
                element,
                startTrigger: 0.8, // 80% of the way into viewport
                endTrigger: 0.2,   // 20% of the way from top of viewport
                onEnter: () => {
                    // Animate in after delay
                    setTimeout(() => {
                        element.style.opacity = '1';
                        element.style.transform = 'scale(1) translate(0, 0)';
                    }, delay);
                },
                onLeaveBack: () => {
                    // Reset when scrolling back up if reset is enabled
                    if (revealOptions.reset && !revealOptions.once) {
                        element.style.opacity = revealOptions.opacity;
                        element.style.transform = transform;
                    }
                }
            });
            
            return trigger;
        });
        
        return triggers;
    }
    
    /**
     * Create a sticky header effect
     */
    stickyHeader(header, options = {}) {
        const defaultOptions = {
            showOnUp: false,       // Show only when scrolling up
            hideOnDown: false,     // Hide when scrolling down
            tolerance: 5,          // Scroll tolerance before state changes
            offset: 0,             // Offset before header becomes sticky
            pinned: 'header--pinned',  // Class when pinned
            unpinned: 'header--unpinned', // Class when unpinned
            top: 'header--top',    // Class when at top
            notTop: 'header--not-top', // Class when not at top
            animation: true,       // Enable animation
            animationDuration: 300 // Animation duration in ms
        };
        
        // Merge options with defaults
        const headerOptions = { ...defaultOptions, ...options };
        
        // Set up initial state
        let lastScrollY = this.scrollY;
        let currentState = 'top';
        let toleranceExceeded = false;
        
        // Apply initial classes
        header.classList.add(headerOptions.top);
        
        // Set up animation if enabled
        if (headerOptions.animation) {
            header.style.transition = `transform ${headerOptions.animationDuration}ms ease-in-out`;
            header.style.willChange = 'transform';
        }
        
        // Create onUpdate function
        const updateHeader = () => {
            // Check if we're past the offset
            const isBeyondOffset = this.scrollY > headerOptions.offset;
            
            // Check scroll direction
            const isScrollingDown = this.scrollY > lastScrollY;
            const isScrollingUp = !isScrollingDown;
            
            // Calculate if tolerance is exceeded
            const scrollDifference = Math.abs(this.scrollY - lastScrollY);
            
            if (scrollDifference > headerOptions.tolerance) {
                toleranceExceeded = true;
            }
            
            // Determine new state
            let newState = currentState;
            
            if (!isBeyondOffset) {
                // At the top
                newState = 'top';
            } else if (toleranceExceeded) {
                if (isScrollingDown && (headerOptions.hideOnDown || headerOptions.showOnUp)) {
                    // Scrolling down past tolerance - hide the header
                    newState = 'unpinned';
                } else if (isScrollingUp && (headerOptions.showOnUp || headerOptions.hideOnDown)) {
                    // Scrolling up past tolerance - show the header
                    newState = 'pinned';
                }
                
                toleranceExceeded = false;
            }
            
            // Update state if changed
            if (newState !== currentState) {
                // Remove all state classes
                header.classList.remove(headerOptions.top, headerOptions.notTop, headerOptions.pinned, headerOptions.unpinned);
                
                // Add appropriate classes
                if (newState === 'top') {
                    header.classList.add(headerOptions.top);
                } else {
                    header.classList.add(headerOptions.notTop);
                    header.classList.add(headerOptions[newState]);
                    
                    // Apply transform for animation
                    if (headerOptions.animation) {
                        header.style.transform = newState === 'pinned' ? 
                            'translateY(0)' : 
                            `translateY(-${header.offsetHeight}px)`;
                    }
                }
                
                currentState = newState;
            }
            
            // Update last scroll position
            lastScrollY = this.scrollY;
        };
        
        // Create trigger for the header
        const trigger = this.createTrigger({
            type: 'scroll',
            start: 0,
            end: document.body.scrollHeight,
            onUpdate: updateHeader
        });
        
        return trigger;
    }
    
    /**
     * Create a scroll progress indicator
     */
    scrollProgress(element, options = {}) {
        const defaultOptions = {
            direction: 'horizontal', // 'horizontal' or 'vertical'
            color: '#007bff',      // Progress color
            height: '4px',         // Progress bar height (for horizontal)
            width: '4px',          // Progress bar width (for vertical)
            position: 'top',       // 'top', 'bottom' (for horizontal); 'left', 'right' (for vertical)
            container: null,       // Container to measure progress against (default: entire page)
            showPercentage: false, // Show percentage text
            zIndex: 9999,          // Z-index for the progress bar
            formatPercentage: p => `${Math.round(p * 100)}%` // Format percentage text
        };
        
        // Merge options with defaults
        const progressOptions = { ...defaultOptions, ...options };
        
        // Get container element
        const container = progressOptions.container || document.documentElement;
        
        // Create progress bar element if not provided
        const progressBar = element || document.createElement('div');
        
        // Add progress bar to DOM if newly created
        if (!element) {
            // Create progress bar styles
            progressBar.style.position = 'fixed';
            progressBar.style.zIndex = progressOptions.zIndex;
            
            if (progressOptions.direction === 'horizontal') {
                progressBar.style.height = progressOptions.height;
                progressBar.style.width = '0%';
                progressBar.style.left = '0';
                
                if (progressOptions.position === 'top') {
                    progressBar.style.top = '0';
                } else {
                    progressBar.style.bottom = '0';
                }
            } else {
                progressBar.style.width = progressOptions.width;
                progressBar.style.height = '0%';
                progressBar.style.bottom = '0';
                
                if (progressOptions.position === 'left') {
                    progressBar.style.left = '0';
                } else {
                    progressBar.style.right = '0';
                }
            }
            
            progressBar.style.backgroundColor = progressOptions.color;
            progressBar.style.transformOrigin = 'left top';
            progressBar.style.willChange = progressOptions.direction === 'horizontal' ? 'width' : 'height';
            
            // Add to document
            document.body.appendChild(progressBar);
        }
        
        // Create percentage indicator if needed
        let percentageIndicator = null;
        
        if (progressOptions.showPercentage) {
            percentageIndicator = document.createElement('div');
            percentageIndicator.style.position = 'fixed';
            percentageIndicator.style.zIndex = progressOptions.zIndex;
            percentageIndicator.style.backgroundColor = progressOptions.color;
            percentageIndicator.style.color = '#fff';
            percentageIndicator.style.padding = '5px 10px';
            percentageIndicator.style.borderRadius = '3px';
            percentageIndicator.style.fontSize = '12px';
            percentageIndicator.style.fontWeight = 'bold';
            
            if (progressOptions.direction === 'horizontal') {
                if (progressOptions.position === 'top') {
                    percentageIndicator.style.top = progressOptions.height;
                } else {
                    percentageIndicator.style.bottom = progressOptions.height;
                }
                percentageIndicator.style.right = '10px';
            } else {
                if (progressOptions.position === 'left') {
                    percentageIndicator.style.left = progressOptions.width;
                } else {
                    percentageIndicator.style.right = progressOptions.width;
                }
                percentageIndicator.style.bottom = '10px';
            }
            
            document.body.appendChild(percentageIndicator);
        }
        
        // Create scroll trigger
        const trigger = this.createTrigger({
            type: 'scroll',
            start: 0,
            end: () => {
                // Get scroll height of the container
                const containerHeight = container.scrollHeight - window.innerHeight;
                return Math.max(containerHeight, 10); // Minimum 10px to avoid division by zero
            },
            onUpdate: (trigger) => {
                const { progress } = trigger;
                
                // Update progress bar style
                if (progressOptions.direction === 'horizontal') {
                    progressBar.style.width = `${progress * 100}%`;
                } else {
                    progressBar.style.height = `${progress * 100}%`;
                }
                
                // Update percentage indicator if present
                if (percentageIndicator) {
                    percentageIndicator.textContent = progressOptions.formatPercentage(progress);
                }
            }
        });
        
        return {
            trigger,
            progressBar,
            percentageIndicator,
            destroy: () => {
                // Remove from DOM if we created these elements
                if (!element && progressBar.parentNode) {
                    progressBar.parentNode.removeChild(progressBar);
                }
                
                if (percentageIndicator && percentageIndicator.parentNode) {
                    percentageIndicator.parentNode.removeChild(percentageIndicator);
                }
            }
        };
    }
    
    /**
     * Destroy the SmoothScroll instance and clean up
     */
    destroy() {
        // Stop animation loop
        this.stopLoop();
        
        // Remove event listeners
        window.removeEventListener('scroll', this.handleScroll);
        window.removeEventListener('resize', this.handleResize);
        window.removeEventListener('orientationchange', this.handleResize);
        
        // Clear references
        this.animations = [];
        this.triggers = [];
    }
}

// Export as global or module
if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
    module.exports = SmoothScroll;
} else {
    window.SmoothScroll = SmoothScroll;
}