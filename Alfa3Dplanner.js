// --- DİL ÇEVİRİ PAKETLERİ ---
const translations = {
    ru: {
        tab_room: "Комната",
        tab_modules: "Модули",
        room_settings: "Размеры (мм)",
        width: "Ширина (X):",
        depth: "Глубина (Z):",
        height: "Высота (Y):",
        update_btn: "Обновить",
        lower_modules: "Нижние модули",
        upper_modules: "Верхние модули",
        mod_std_60: "Стандарт 60см",
        mod_sink_80: "Мойка 80см",
        mod_top_60: "Верхний 60см"
    },
    kk: {
        tab_room: "Бөлме",
        tab_modules: "Модульдер",
        room_settings: "Өлшемдері (мм)",
        width: "Ені (X):",
        depth: "Тереңдігі (Z):",
        height: "Биіктігі (Y):",
        update_btn: "Жаңарту",
        lower_modules: "Төменгі модульдер",
        upper_modules: "Жоғарғы модульдер",
        mod_std_60: "Стандарт 60см",
        mod_sink_80: "Жуғыш 80см",
        mod_top_60: "Жоғарғы 60см"
    }
};

let currentLang = 'ru';

function switchLanguage(lang) {
    currentLang = lang;
    
    document.getElementById('btn-ru').classList.remove('active');
    document.getElementById('btn-kk').classList.remove('active');
    document.getElementById('btn-' + lang).classList.add('active');

    const t = translations[lang];
    document.getElementById('btn-tab-room').innerText = t.tab_room;
    document.getElementById('btn-tab-modules').innerText = t.tab_modules;
    document.getElementById('lbl-room-settings').innerText = t.room_settings;
    document.getElementById('lbl-width').innerText = t.width;
    document.getElementById('lbl-depth').innerText = t.depth;
    document.getElementById('lbl-height').innerText = t.height;
    document.getElementById('btn-update').innerText = t.update_btn;
    document.getElementById('lbl-lower-modules').innerText = t.lower_modules;
    document.getElementById('lbl-upper-modules').innerText = t.upper_modules;
    document.getElementById('lbl-mod-std').innerText = t.mod_std_60;
    document.getElementById('lbl-mod-sink').innerText = t.mod_sink_80;
    document.getElementById('lbl-mod-top').innerText = t.mod_top_60;
}

function switchTab(tabId) {
    document.getElementById('btn-tab-room').classList.remove('active');
    document.getElementById('btn-tab-modules').classList.remove('active');
    document.getElementById('tab-room').classList.remove('active');
    document.getElementById('tab-modules').classList.remove('active');
    
    document.getElementById('btn-tab-' + tabId).classList.add('active');
    document.getElementById('tab-' + tabId).classList.add('active');
}

// --- THREE.JS ENGINE ---
const container = document.getElementById('canvas-container');
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x111827);

const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(3, 4, 5);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
container.appendChild(renderer.domElement);

const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.maxPolarAngle = Math.PI / 2 - 0.01;

// --- LIGHTS ---
const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
scene.add(ambientLight);

const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
dirLight.position.set(5, 10, 7);
dirLight.castShadow = true;
dirLight.shadow.mapSize.width = 2048;
dirLight.shadow.mapSize.height = 2048;
scene.add(dirLight);

let roomGroup = new THREE.Group();
let modulesGroup = new THREE.Group();
scene.add(roomGroup);
scene.add(modulesGroup);

let currentRoom = { w: 3200, d: 4000, h: 2500 };

function drawRoom(width, depth, height) {
    currentRoom = { w: width, d: depth, h: height };
    while(roomGroup.children.length > 0){ roomGroup.remove(roomGroup.children[0]); }

    const w = width / 1000;
    const d = depth / 1000;
    const h = height / 1000;

    const floorMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.6, metalness: 0.1 });
    const wallMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.9 });

    const floor = new THREE.Mesh(new THREE.PlaneGeometry(w, d), floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    roomGroup.add(floor);

    const backWall = new THREE.Mesh(new THREE.PlaneGeometry(w, h), wallMat);
    backWall.position.set(0, h / 2, -d / 2);
    backWall.receiveShadow = true;
    roomGroup.add(backWall);

    const leftWall = new THREE.Mesh(new THREE.PlaneGeometry(d, h), wallMat);
    leftWall.rotation.y = Math.PI / 2;
    leftWall.position.set(-w / 2, h / 2, 0);
    leftWall.receiveShadow = true;
    roomGroup.add(leftWall);

    const gridHelper = new THREE.GridHelper(Math.max(w, d) * 2, 40, 0x475569, 0x334155);
    gridHelper.position.y = 0.005;
    roomGroup.add(gridHelper);
}

function addKitchenModule(w_mm, h_mm, d_mm, type) {
    const w = w_mm / 1000;
    const h = h_mm / 1000;
    const d = d_mm / 1000;

    const moduleGroup = new THREE.Group();

    const bodyMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.7 });
    const frontMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.4, metalness: 0.1 });
    const handleMat = new THREE.MeshStandardMaterial({ color: 'gold', roughness: 0.2, metalness: 0.8 });

    const body = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), bodyMat);
    body.position.y = h / 2;
    body.castShadow = true;
    body.receiveShadow = true;
    moduleGroup.add(body);

    const door = new THREE.Mesh(new THREE.BoxGeometry(w - 0.004, h - 0.004, 0.01), frontMat);
    door.position.set(0, h / 2, d / 2 + 0.005);
    door.castShadow = true;
    moduleGroup.add(door);

    const handle = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.015, 0.015), handleMat);
    handle.position.set(0, h - 0.1, d / 2 + 0.015);
    moduleGroup.add(handle);

    const existingCount = modulesGroup.children.length;
    const initialX = - (currentRoom.w / 2000) + (w / 2) + (existingCount * 0.65);
    const initialZ = - (currentRoom.d / 2000) + (d / 2);
    let initialY = 0;

    if(type === 'upper') {
        initialY = 1.4;
    }

    moduleGroup.position.set(initialX, initialY, initialZ);

    moduleGroup.scale.set(0, 0, 0);
    modulesGroup.add(moduleGroup);

    let progress = 0;
    function spawnAnimation() {
        if(progress < 1) {
            progress += 0.08;
            const scale = Math.min(progress, 1);
            moduleGroup.scale.set(scale, scale, scale);
            requestAnimationFrame(spawnAnimation);
        }
    }
    spawnAnimation();
}

function updateRoomDimensions() {
    const w = parseFloat(document.getElementById('room-width').value);
    const d = parseFloat(document.getElementById('room-depth').value);
    const h = parseFloat(document.getElementById('room-height').value);
    drawRoom(w, d, h);
}

drawRoom(3200, 4000, 2500);

function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

animate();
