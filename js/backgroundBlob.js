import { gsap, MorphSVGPlugin } from "../assets/gsap/gsap-public/src/all.js";
gsap.registerPlugin(MorphSVGPlugin);

// Optimized blob shapes with consistent point structure for smooth morphing
const blobShapes = {
    camera: "M200,250 C180,220 150,200 120,200 C100,180 80,160 80,140 C80,120 100,100 120,100 L180,100 C200,100 220,80 240,80 L360,80 C380,80 400,100 420,100 L480,100 C500,100 520,120 520,140 C520,160 500,180 480,200 C450,200 420,220 400,250 L400,350 C400,380 380,400 350,400 L250,400 C220,400 200,380 200,350 Z M300,320 C330,320 360,290 360,260 C360,230 330,200 300,200 C270,200 240,230 240,260 C240,290 270,320 300,320 Z",

    heart: "M300,450 C280,420 250,400 220,380 C180,350 150,320 150,280 C150,240 180,200 220,200 C250,200 280,220 300,250 C320,220 350,200 380,200 C420,200 450,240 450,280 C450,320 420,350 380,380 C350,400 320,420 300,450 Z",

    arrow: "M300,150 C320,130 350,120 380,140 L450,180 C470,190 480,200 480,220 C480,240 470,250 450,260 L380,280 L380,320 C380,340 370,360 350,370 L450,400 C470,410 480,420 480,440 C480,460 470,470 450,480 L300,550 C280,560 270,560 250,550 L100,480 C80,470 70,460 70,440 C70,420 80,410 100,400 L200,370 C180,360 170,340 170,320 L170,280 L100,260 C80,250 70,240 70,220 C70,200 80,190 100,180 L170,140 C190,120 220,130 240,150 L280,130 C290,120 300,130 300,150 Z",

    circle: "M300,100 C200,100 120,180 120,280 C120,380 200,460 300,460 C400,460 480,380 480,280 C480,180 400,100 300,100 Z",

    diamond: "M300,120 C320,140 350,170 400,220 C420,240 440,260 460,280 C480,300 480,320 460,340 C440,360 420,380 400,400 C350,450 320,480 300,500 C280,480 250,450 200,400 C180,380 160,360 140,340 C120,320 120,300 140,280 C160,260 180,240 200,220 C250,170 280,140 300,120 Z",

    lens: "M300,200 C250,180 200,190 160,220 C120,250 100,280 100,300 C100,320 120,350 160,380 C200,410 250,420 300,400 C350,420 400,410 440,380 C480,350 500,320 500,300 C500,280 480,250 440,220 C400,190 350,180 300,200 Z M300,250 C330,240 360,250 380,270 C400,290 400,310 380,330 C360,350 330,360 300,350 C270,360 240,350 220,330 C200,310 200,290 220,270 C240,250 270,240 300,250 Z",

    dollar: "M280,100 C290,90 310,90 320,100 L320,150 C350,160 380,180 400,210 C420,240 430,270 430,300 C430,330 420,360 400,390 C380,420 350,440 320,450 L320,500 C310,510 290,510 280,500 L280,450 C250,440 220,420 200,390 C180,360 170,330 170,300 C170,280 180,260 200,250 C220,240 250,240 280,250 L280,200 C250,190 220,180 200,160 C180,140 170,120 170,100 C170,80 180,60 200,50 C220,40 250,40 280,50 L280,100 Z M280,350 C250,340 220,320 200,290 C180,260 180,230 200,200 C220,170 250,150 280,160 L280,350 Z M320,240 C350,250 380,270 400,300 C420,330 420,360 400,390 C380,420 350,440 320,430 L320,240 Z",

    cloud: "M180,300 C160,280 150,250 160,220 C170,190 200,170 230,170 C250,150 280,140 310,150 C340,160 360,180 370,210 C400,200 430,210 450,230 C470,250 480,280 470,310 C460,340 440,360 410,370 L210,370 C180,360 160,340 150,310 C140,280 150,250 180,300 Z",

    system: "M300,150 C330,150 360,170 380,200 C400,230 410,260 420,290 C450,300 480,320 500,350 C520,380 520,410 500,440 C480,470 450,480 420,470 C410,500 400,530 380,560 C360,590 330,600 300,600 C270,600 240,590 220,560 C200,530 190,500 180,470 C150,480 120,470 100,440 C80,410 80,380 100,350 C120,320 150,300 180,290 C190,260 200,230 220,200 C240,170 270,150 300,150 Z M300,250 C320,250 340,270 340,290 C340,310 320,330 300,330 C280,330 260,310 260,290 C260,270 280,250 300,250 Z",

    instagram: "M220,150 C180,150 150,180 150,220 L150,380 C150,420 180,450 220,450 L380,450 C420,450 450,420 450,380 L450,220 C450,180 420,150 380,150 Z M300,350 C330,350 360,320 360,290 C360,260 330,230 300,230 C270,230 240,260 240,290 C240,320 270,350 300,350 Z M380,200 C390,200 400,190 400,180 C400,170 390,160 380,160 C370,160 360,170 360,180 C360,190 370,200 380,200 Z",

    square: "M180,180 C160,180 150,190 150,210 L150,390 C150,410 160,420 180,420 L420,420 C440,420 450,410 450,390 L450,210 C450,190 440,180 420,180 Z"
};

const shapeKeys = Object.keys(blobShapes);
const blobPath = document.querySelector('.blob-path');
const svg = document.querySelector('#morphing-blob');

let currentShapeIndex = 0;
let currentX = 0;
let currentY = 0;

// Function to get smooth random movement
function getRandomPosition() {
    return {
        x: (Math.random()) * 25, // Gentle movement range
        y: (Math.random()) * 15
    };
}

// Function to create smooth morphing animation
function morphToNextShape() {
    const nextShapeIndex = (currentShapeIndex + 1) % shapeKeys.length;
    const nextShape = blobShapes[shapeKeys[nextShapeIndex]];
    const newPosition = getRandomPosition();

    // Create main timeline
    const tl = gsap.timeline();

    // Use MorphSVGPlugin for superior morphing
    tl.to(blobPath, {
        duration: 3,
        morphSVG: nextShape,
        ease: "none"
    });

    // Linear floating movement
    tl.to(svg, {
        duration: 3,
        x: newPosition.x,
        y: newPosition.y,
        ease: "none"
    }, 0);

    // Linear scale changes
    tl.to(blobPath, {
        duration: 3,
        scale: 0.9 + Math.random() * 0.2,
        transformOrigin: "center",
        ease: "none"
    }, 0);

    // Very gentle rotation
    tl.to(blobPath, {
        duration: 6,
        rotation: currentShapeIndex * 15, // Slow accumulated rotation
        transformOrigin: "center",
        ease: "none"
    }, 0);

    currentShapeIndex = nextShapeIndex;
    currentX = newPosition.x;
    currentY = newPosition.y;

    console.log(`Morphing to: ${shapeKeys[nextShapeIndex]}`);
}

// Initialize with first shape
gsap.set(blobPath, {
    attr: { d: blobShapes[shapeKeys[0]] },
    transformOrigin: "center"
});

// Start the continuous animation cycle
function startContinuousAnimation() {
    morphToNextShape();

    // Continue with varied timing for organic feel
    setTimeout(() => {
        startContinuousAnimation();
    }, 4000 + Math.random() * 2000); // 4-6 seconds between morphs
}

// Add linear pulsing glow effect
gsap.to('.blob-path', {
    duration: 8,
    filter: 'blur(50px) brightness(1.2) opacity(.4)',
    ease: "none",
    yoyo: true,
    repeat: -1
});

// Start animation after short delay
setTimeout(startContinuousAnimation, 2000);

// Create ambient floating particles
function createAmbientParticles() {
    const particleCount = 30;

    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.style.position = 'fixed';
        particle.style.width = Math.random() * 3 + 1 + 'px';
        particle.style.height = particle.style.width;
        particle.style.backgroundColor = 'rgb(255, 255, 255)';
        particle.style.borderRadius = '50%';
        particle.style.pointerEvents = 'none';
        particle.style.left = Math.random() * 100 + 'vw';
        particle.style.top = Math.random() * 100 + 'vh';
        particle.style.filter = 'blur(1px)';

        document.body.appendChild(particle);

        // Linear floating animation
        gsap.to(particle, {
            duration: 15 + Math.random() * 25,
            x: (Math.random() - 0.5) * window.innerWidth * 0.5,
            y: (Math.random() - 0.5) * window.innerHeight * 0.5,
            opacity: Math.random() * 0.5,
            ease: "none",
            repeat: -1,
            yoyo: true
        });

        // Linear scale pulsing
        gsap.to(particle, {
            duration: 3 + Math.random() * 4,
            scale: 0.5 + Math.random(),
            ease: "none",
            repeat: -1,
            yoyo: true
        });
    }
}

createAmbientParticles();