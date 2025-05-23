if (!document.querySelector(".mover")) {
    document.body.insertAdjacentHTML("beforeend", `<div class="mover"></div>`);    
};
if (!document.querySelector(".dot")) {
    document.body.insertAdjacentHTML("beforeend", `<div class="dot"></div>`);    
};

const dotAndMagnetStyle = `
.mover {
    border: 1px solid #ffffff;
    border-radius: 25px;
    position: absolute;
    z-index: 11;
    user-select: none;
    background: transparent;
    pointer-events: none;
    mix-blend-mode: difference;
}

.dot {
    position: absolute;
    width: 10px;
    height: 10px;
    background-color: #1a1a1a;
    mix-blend-mode: difference;
    /* opacity: .5; */
    backdrop-filter: invert(1);
    border-radius: 50%;
    pointer-events: none;
    z-index: 12;
    transform: translate(-5px, -5px);
}`

document.head.insertAdjacentHTML("beforeend", `<style>${dotAndMagnetStyle}</style>`);

const magnet = document.querySelector(".mover");
const dot = document.querySelector(".dot");

let mouseX = 0, mouseY = 0;
let magnetX = 0, magnetY = 0;
let width = 20, height = 20;
let targetWidth = 20, targetHeight = 20;
let currentOpacity = 0.5, targetOpacity = 0.5;
let isHoveringMagnetTarget = false;
let currentMagnetTarget = null;
let isMouseDown = false;

const MAGNET_TARGET_CLASS = "magnet-box";

function handlePointerMove(e) {
    mouseX = e.clientX + window.scrollX;
    mouseY = e.clientY + window.scrollY;

    dot.style.transform = `translate(${mouseX - 5}px, ${mouseY - 5}px)`;

    const target = e.target;

    if (target.classList.contains(MAGNET_TARGET_CLASS) && !isMouseDown) {
        isHoveringMagnetTarget = true;
        currentMagnetTarget = target;

        const rect = target.getBoundingClientRect();
        magnetX = rect.left + window.scrollX;
        magnetY = rect.top + window.scrollY;
        targetWidth = rect.width;
        targetHeight = rect.height;
        targetOpacity = 1;
    } else {
        if (!isHoveringMagnetTarget || currentMagnetTarget !== target) {
            isHoveringMagnetTarget = false;
            currentMagnetTarget = null;

            // Re-center while still easing
            magnetX = mouseX - width / 2;
            magnetY = mouseY - height / 2;

            if (!isMouseDown) {
                targetWidth = 20;
                targetHeight = 20;
                targetOpacity = 0.5;
            }
        }
    }
}



function handleMouseDown(e) {
    if (e.target.classList.contains(MAGNET_TARGET_CLASS)) {
        let relativeScaler = 0.9;
        let tw = targetWidth - targetWidth * relativeScaler;
        let th = targetHeight - targetHeight * relativeScaler;
        targetWidth *= relativeScaler;
        targetHeight *= relativeScaler;
        magnetX += tw/2;
        magnetY += th/2;
        return;
    };
    
    isMouseDown = true;
    
    // Ease resize and position to center on mouse
    targetWidth = 5;
    targetHeight = 5;
    magnetX = mouseX - 2.5;
    magnetY = mouseY - 2.5;
}

function handleMouseUp(e) {
    if (e.target.classList.contains(MAGNET_TARGET_CLASS)) {
        targetWidth = e.target.getBoundingClientRect().width;
        targetHeight = e.target.getBoundingClientRect().height;
        magnetX = e.target.getBoundingClientRect().left;
        magnetY = e.target.getBoundingClientRect().top;
        return;
    };

    isMouseDown = false;

    // Reset size and recenter
    targetWidth = 20;
    targetHeight = 20;
    magnetX = mouseX - 10;
    magnetY = mouseY - 10;
}

function animateMagnet() {
    const easeAmount = isMouseDown ? 0.2 : (isHoveringMagnetTarget ? 0.08 : 0.15);

    // Default magnet state
    if (!magnet.style.transform) {
        magnet.style.transform = `translate(${mouseX - width / 2}px, ${mouseY - height / 2}px)`;
        magnet.style.width = `${width}px`;
        magnet.style.height = `${height}px`;
        magnet.style.opacity = currentOpacity;
    }

    const transformValue = magnet.style.transform;
    let currentX = mouseX - width / 2;
    let currentY = mouseY - height / 2;

    const match = transformValue.match(/translate\(([^,]+)px,\s*([^)]+)px\)/);
    if (match) {
        currentX = parseFloat(match[1]);
        currentY = parseFloat(match[2]);
    }

    const newX = currentX + (magnetX - currentX) * easeAmount;
    const newY = currentY + (magnetY - currentY) * easeAmount;

    width += (targetWidth - width) * easeAmount;
    height += (targetHeight - height) * easeAmount;
    currentOpacity += (targetOpacity - currentOpacity) * easeAmount;

    magnet.style.transform = `translate(${newX}px, ${newY}px)`;
    magnet.style.width = `${width}px`;
    magnet.style.height = `${height}px`;
    magnet.style.opacity = currentOpacity;

    requestAnimationFrame(animateMagnet);
}

document.addEventListener("pointermove", handlePointerMove, { capture: true });
document.addEventListener("mousedown", handleMouseDown, { capture: true });
document.addEventListener("mouseup", handleMouseUp, { capture: true });
document.addEventListener("pointerdown", handleMouseDown, { capture: true });
document.addEventListener("pointerup", handleMouseUp, { capture: true });

document.addEventListener("mouseleave", function (e) {
    if (e.target.classList && e.target.classList.contains(MAGNET_TARGET_CLASS) && currentMagnetTarget === e.target) {
        if (!e.relatedTarget || !e.relatedTarget.classList.contains(MAGNET_TARGET_CLASS)) {
            isHoveringMagnetTarget = false;
            currentMagnetTarget = null;

            if (!isMouseDown) {
                magnetX = mouseX - width / 2;
                magnetY = mouseY - height / 2;
                targetWidth = 20;
                targetHeight = 20;
                targetOpacity = 0.5;
            }
        }
    }
}, true);

// Start animation loop
animateMagnet();