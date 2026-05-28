const canvas = document.querySelector('#canvas');
const path = document.querySelector('#heart-path');

// --- Three.js Setup ---
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 400;

const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true,
    alpha: true
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

// --- Particle Creation Logic ---
const length = path.getTotalLength();
const vertices = [];
const particlesCount = Math.floor(length / 0.1); // Density matching the screenshot's loop

// We'll use a BufferGeometry for performance
const geometry = new THREE.BufferGeometry();
const positions = new Float32Array(particlesCount * 3);
geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

// Material with a glow/point effect
const material = new THREE.PointsMaterial({
    color: 0xfe2c55,
    size: 2,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false
});

const points = new THREE.Points(geometry, material);
scene.add(points);

const tl = gsap.timeline();

// Recreating the logic from the screenshot
for (let i = 0; i < length; i += 0.1) {
    const idx = Math.floor(i / 0.1);
    const point = path.getPointAtLength(i);

    // Centering the heart (approximate based on path d="M300,500...")
    // SVG coords: 0-600. Center is 300,300.
    // Three.js world coords: subtract 300 to center it.
    const vector = new THREE.Vector3(point.x - 300, -(point.y - 300), 0);

    // Add jitter as shown in the screenshot
    vector.x += (Math.random() - 0.5) * 30;
    vector.y += (Math.random() - 0.5) * 30;
    vector.z += (Math.random() - 0.5) * 70;

    vertices.push(vector);

    // GSAP Animation as shown in the screenshot
    tl.from(vector, {
        x: 0, // 600/2 - 300 (centered)
        y: 0, // -552/2 -> middle (centered)
        z: 0,
        ease: "power2.inOut",
        duration: "random(2, 5)"
    }, i * 0.002);
}

// --- Animation Loop ---
function animate() {
    requestAnimationFrame(animate);

    // Update geometry positions from animated vectors
    const posAttr = geometry.attributes.position;
    for (let i = 0; i < vertices.length; i++) {
        const v = vertices[i];
        posAttr.setXYZ(i, v.x, v.y, v.z);
    }
    posAttr.needsUpdate = true;

    // Subtle rotation for "premium" 3D feel
    points.rotation.y += 0.002;
    points.rotation.x = Math.sin(Date.now() * 0.001) * 0.1;

    renderer.render(scene, camera);
}

// --- Handle Resize ---
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// Start
animate();
tl.play();
