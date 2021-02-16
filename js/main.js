// Setup data that will be used, stored at the top for easy manipulation
const el = document.getElementById("render");
const DEBUG = {
	WIDTH: el.getBoundingClientRect().width,
	HEIGHT: el.getBoundingClientRect().height,
};
// Rotation of object being rendered
let rotation = {
	x: 0,
	y: 0,
	z: 0,
};

// Setup renderer
const renderer = new THREE.WebGLRenderer();
renderer.setSize(DEBUG.WIDTH, DEBUG.HEIGHT);
el.appendChild(renderer.domElement);
// Setup camera
const camera = new THREE.PerspectiveCamera(75, DEBUG.WIDTH / DEBUG.HEIGHT, 0.1, 1000);
camera.position.set(0, 0, -150);
camera.lookAt(0, 0, 0);
// Setup scene
const scene = new THREE.Scene();
// Setup lights
const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
const directionalLight = new THREE.DirectionalLight(0xffffff, 0.6);
directionalLight.position.set(1, 1, -1).normalize();
// Add lights to the scene
scene.add(ambientLight);
scene.add(directionalLight);

// Initialize mouse/touchscreen controls
mouseInit(el, (dx, dy) => {
	rotation.x -= dy / 50;
	rotation.x = Math.max(Math.min(rotation.x, Math.PI / 2), -Math.PI / 2);
	rotation.y += dx / 50;
});

// Method to remove an obj
function remove(obj) {
	if (obj.geometry) obj.geometry.dispose();
	if (obj.material) obj.material.dispose();
	for (let i of obj.children) remove(i);
	scene.remove(obj);
}

// Add a plane to the scene
function addPlane(x, y, z, c, k) {
	// Scaling of c for viewing purposes
	c *= k;
	// Create base geometry of "plane" (it's a box)
	const geometry = new THREE.BoxGeometry(100, 100, 1);
	// Get the normal vector
	const normal = new THREE.Vector3(x, y, z);
	// Create a quarternion from the required rotation from the default normal to the custom normal
	const quaternion = new THREE.Quaternion().setFromUnitVectors(
		new THREE.Vector3(0, 0, 1),
		normal.normalize()
	);
	// Set the default position at 0,0,0
	const position = new THREE.Vector3(0, 0, 0);
	// Create a transformation matrix from the posiion, quarternion and (1,1,1)
	const matrix = new THREE.Matrix4().compose(position, quaternion, new THREE.Vector3(1, 1, 1));
	// Apply the matrix to the box geometry
	geometry.applyMatrix4(matrix);
	// Move the "plane" (box) in the normal direction by c
	geometry.translate(...normal.multiplyScalar(c).toArray());
	// Material for rendering them with shading
	const material = new THREE.MeshLambertMaterial({
		// Random colour
		color: `hsl(${Math.random() * 255}, 100%, 50%)`,
		// Able to view from both sides (fudge)
		side: THREE.DoubleSide,
	});
	// Create the mesh for rendering from the geometry and the material
	const plane = new THREE.Mesh(geometry, material);
	// Add the "plane" to the mesh
	scene.add(plane);
}

// Given a 4.3 matrix render planes for the equations
function addMatrix(matrix, k) {
	while (scene.children.length > 2) remove(scene.children[2]);
	for (let i of matrix) addPlane(...i, k);
}

// Quick helper function
const $ = id => parseFloat(document.getElementById(id).innerText);
// Get matrix from HTML elements
function getFromHTML() {
	addMatrix(
		[
			[$("x1"), $("y1"), $("z1"), $("c1")],
			[$("x2"), $("y2"), $("z2"), $("c2")],
			[$("x3"), $("y3"), $("z3"), $("c3")],
		],
		1
	);
}

// Create and call animation loop
function animate() {
	// Set rotation on displayed object
	scene.children.slice(2).forEach(e => e.rotation.set(rotation.x, rotation.y, rotation.z));
	// Request the animation loop to be called again
	requestAnimationFrame(animate);
	// Render the scene
	renderer.render(scene, camera);
}
animate();
