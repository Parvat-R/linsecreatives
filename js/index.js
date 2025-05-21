gsap.registerPlugin(ScrollTrigger);

gsap.timeline({
  scrollTrigger: {
    scrub: 1,
    trigger: "#feature-video",
    start: "top 90%",
    end: "bottom 30%",
  },
});