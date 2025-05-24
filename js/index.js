import { gsap, ScrollTrigger, SplitText, ScrollSmoother } from "../assets/gsap/gsap-public/src/all.js";

const nav = document.getElementById('nav');
const root = document.getElementById('root');
const showReel = document.querySelector("video.show-reel-video");
showReel.volume = 0.1;


function restartVideo() {
    showReel.pause();
    showReel.currentTime = 0;
    showReel.play();
}


/* THE ESSENTIAL FUNCTION */
function parametricBlend(t) {
    const sqr = t * t;
    return sqr / (2.0 * (sqr - t) + 1.0);
}

// Lenis Smooth Scroll Setup
const lenis = new Lenis({
    wrapper: root
});

lenis.on('scroll', ScrollTrigger.update);

gsap.ticker.add((time) => {
    lenis.raf(time * 1000);
});

gsap.ticker.lagSmoothing(0);

/*
    ANIMATION CODES
*/
gsap.registerPlugin(ScrollTrigger);
gsap.registerPlugin(SplitText);



SplitText.create("#hero .title", {
    type: "lines",
    autoSplit: true,
    onSplit: (self) => {
        return gsap.from(self.lines, {
            y: 100,
            opacity: 0,
            stagger: 0.1,
            scale: 0.5
        });
    },
    onComplete: () => {
    }
});

gsap.to("#hero .title", {
    scrollTrigger: {
        trigger: "#hero",
        scroller: "#root",
        scrub: true,
        pin: true,
        start: "top top-200px",
        end: "top top-=500px",
        invalidateOnRefresh: true
    },
    scale: 5,
    ease: "none",
    opacity: 0,
})


// Store initial values
const initialWidth = showReel.offsetWidth;
const initialBorderRadius = 30;


// --- First Scroll Animation (Expand to fullscreen) ---
const firstAnimation = gsap.fromTo('.show-reel-video', { scale: .8, y: '-10vh' }, {
    scrollTrigger: {
        trigger: '#video-feature',
        scroller: '#root',
        scrub: 1,
        start: 'top 90%',
        end: 'top 10%',
        invalidateOnRefresh: true,
    },
    scale: 1,
    y: 0,
    opacity: 1,
    width: '100vw',
    ease: 'linear',

    onUpdate: function () {
        const progress = this.totalProgress();
        if (progress < 0.1) {
            showReel.pause();
            showReel.currentTime = 0;
        } else if (showReel.played) {
            showReel.play();
        }
        const px = Math.floor(progress * 100);
        const borderRadius = initialBorderRadius - Math.floor(progress * initialBorderRadius);

        nav.style.transform = `translateY(-${px}px)`;
        gsap.set('.show-reel-video', { borderRadius: `${borderRadius}px` });

        if (typeof isMuted !== 'undefined' && !isMuted) {
            showReel.volume = parametricBlend(progress);
        } else {
            showReel.volume = 0;
        }
    }
});

// --- Second Scroll Animation (Shrink from fullscreen) ---
const secondAnimation = gsap.to('.show-reel-video', {
    scrollTrigger: {
        trigger: '#video-feature',
        scroller: '#root',
        scrub: 1,
        start: 'top -150%',
        end: 'top -250%',
        invalidateOnRefresh: true,
    },
    width: '300px',
    ease: 'none',
    onUpdate: function () {
        const progress = this.totalProgress();
        const px = Math.floor((1 - progress) * 100); // Reverse the nav movement
        const borderRadius = Math.floor(progress * 30);

        nav.style.transform = `translateY(-${px}px)`;
        gsap.set('.show-reel-video', { borderRadius: `${borderRadius}px` });

        if (typeof isMuted !== 'undefined' && !isMuted) {
            showReel.volume = 1 - parametricBlend(progress);
        } else {
            showReel.volume = 0;
        }
    },
});



gsap.to('.content', {
    scrollTrigger: {
        trigger: '#video-feature',
        scroller: '#root',
        scrub: 0.1,
        start: 'top -230%',
        end: 'top -290%',
        invalidateOnRefresh: true,
    },
    width: '100%',
    opacity: 1
})


// Optional: Add refresh handler to ensure proper state on window resize
ScrollTrigger.addEventListener("refresh", () => {
    // Reset to initial state if no animations are active
    const firstActive = firstAnimation.scrollTrigger.isActive;
    const secondActive = secondAnimation.scrollTrigger.isActive;

    if (!firstActive && !secondActive) {
        gsap.set('.show-reel-video', {
            width: `${initialWidth}px`,
            borderRadius: `${initialBorderRadius}px`
        });
        nav.style.transform = 'translateY(0px)';
        showReel.volume = 0;
    }
});