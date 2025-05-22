const nav = document.getElementById('nav');
const root = document.getElementById('root');
const showReel = document.querySelector("video.show-reel-video");
showReel.volume = 0;


/* THE ESSENTIAL FUNCTION */
function parametricBlend(t) {
    const sqr = t * t;
    return sqr / (2.0 * (sqr - t) + 1.0);
}

// Lenis Smooth Scroll Setup
// Initialize a new Lenis instance for smooth scrolling
const lenis = new Lenis({
    wrapper: root
});

// Synchronize Lenis scrolling with GSAP's ScrollTrigger plugin
lenis.on('scroll', ScrollTrigger.update);

// Add Lenis's requestAnimationFrame (raf) method to GSAP's ticker
// This ensures Lenis's smooth scroll animation updates on each GSAP tick
gsap.ticker.add((time) => {
  lenis.raf(time * 1000); // Convert time from seconds to milliseconds
});

// Disable lag smoothing in GSAP to prevent any delay in scroll animations
gsap.ticker.lagSmoothing(0);

/*
    ANIMATION CODES
*/
gsap.registerPlugin(ScrollTrigger);

// --- First Scroll Animation ---
gsap.to('.show-reel', {
    scrollTrigger: {
        trigger: '.show-reel-video', // ✅ correct usage
        scroller: '#root',
        scrub: .1, // ✅ smooth scroll
        start: 'top 80%',
        end: 'top top+=10%'
    },
    width: '100%',
    ease: 'none',
    onUpdate: function () {
        const progress = this.totalProgress();
        const px = Math.floor(progress * 100);
        const borderRadius = 30 - Math.floor(progress * 30);
        nav.style.transform = `translateY(-${px}px)`; // ✅ more consistent than `translate`
        gsap.set('.show-reel', { borderRadius: `${borderRadius}px` });
        if (!isMuted) {
            showReel.volume = parametricBlend(progress);
        } else {
            showReel.volume = 0;
        }
    },
    onComplete: function () {
        gsap.set('.show-reel', { borderRadius: 0 });
    }
});

// --- Second Scroll Animation ---
gsap.to('.show-reel', {
    scrollTrigger: {
        trigger: '.show-reel-video',
        scroller: '#root',
        scrub: 1,
        start: 'bottom -150%',
        end: 'bottom -200%',
    },
    scale: 0.7,
    borderRadius: '30px',
    transformOrigin: 'top center',
    ease: 'none',
    onUpdate: function () {
        const progress = this.totalProgress();
        const px = 100 - Math.floor(progress * 100);
        const borderRadius = Math.floor(progress * 30);
        nav.style.transform = `translateY(-${px}px)`;
        gsap.set('.show-reel', { borderRadius: `${borderRadius}px` });
        if (!isMuted) {
            showReel.volume = parametricBlend(1 - progress);
        } else {
            showReel.volume = 0;
        }
    },
});
