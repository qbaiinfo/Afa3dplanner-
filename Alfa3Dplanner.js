// --- DİL SYNC ---
const translations = {
    ru: {
        tab_room: "ПОМЕЩЕНИЕ",
        tab_modules: "МОДУЛИ",
        room_settings: "Габариты каркаса (мм)",
        width: "Ширина (X):",
        depth: "Глубина (Z):",
        height: "Высота (Y):",
        update_btn: "Применить размеры",
        lower_modules: "Нижние базы (H=820, D=560)",
        upper_modules: "Верхние шкафы (H=720, D=320)",
        mod_std_60: "Распашной шкаф N600",
        mod_sink_80: "Мойка под раковину N800",
        mod_top_60: "Навесной шкаф V600"
    },
    kk: {
        tab_room: "БӨЛМЕ",
        tab_modules: "МОДУЛЬДЕР",
        room_settings: "Қаңқа габариттері (мм)",
        width: "Ені (X):",
        depth: "Тереңдігі (Z):",
        height: "Биіктігі (Y):",
        update_btn: "Өлшемдерді енгізу",
        lower_modules: "Төменгі базалар (H=820, D=560)",
        upper_modules: "Жоғарғы шкафтар (H=720, D=320)",
        mod_std_60: "Есікті шкаф N600",
        mod_sink_80: "Жуғыш шкафы N800",
        mod_top_60: "Аспалы шкаф V600"
    }
};

function switchLanguage(lang) {
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

// --- THREE.JS ENGINE PRO ---
const container = document.getElementById('canvas-container');
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0b0f19);

const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(3.5, 4.5, 5.5);

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.2;
container.appendChild(renderer.domElement);

const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.maxPolarAngle = Math.PI / 2 - 0.02;

// --- LIGHTS ---
const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
scene.add(ambientLight);

const mainLight = new THREE.DirectionalLight(0xffffff, 0.8);
mainLight.position.set(6, 12, 8);
mainLight.castShadow = true;
mainLight.shadow.mapSize.width = 4096;
mainLight.shadow.mapSize.height = 4096;
mainLight.shadow.bias = -0.0005;
scene.add(mainLight);

const fillLight = new THREE.DirectionalLight(0xbae6fd, 0.3);
fillLight.position.set(-6, 6, -4);
scene.add(fillLight);

let roomGroup = new THREE.Group();
let modulesGroup = new THREE.Group();
scene.add(roomGroup);
scene.add(modulesGroup);

let currentRoom = { w: 3200, d: 4000, h: 2500 };
const thickness = 0.018; // 18mm korpus kalınlığı

// MATERIALS
const floorMaterial = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.5, metalness: 0.2 });
const wallMaterial = new THREE.MeshStandardMaterial({ color: 0xf1f5f9, roughness: 0.85 });
const bodyMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.6 });
const facadeMaterial = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.35, metalness: 0.1 });
const edgeMaterial = new THREE.MeshBasicMaterial({ color: 0x475569, wireframe: true });

function drawRoom(width, depth, height) {
    currentRoom = { w: width, d: depth, h: height };
    while(roomGroup.children.length > 0){ roomGroup.remove(roomGroup.children[0]); }

    const w = width / 1000;
    const d = depth / 1000;
    const h = height / 1000;

    const floor = new THREE.Mesh(new THREE.PlaneGeometry(w, d), floorMaterial);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    roomGroup.add(floor);

    const backWall = new THREE.Mesh(new THREE.PlaneGeometry(w, h), wallMaterial);
    backWall.position.set(0, h / 2, -d / 2);
    backWall.receiveShadow = true;
    roomGroup.add(backWall);

    const leftWall = new THREE.Mesh(new THREE.PlaneGeometry(d, h), wallMaterial);
    leftWall.rotation.y = Math.PI / 2;
    leftWall.position.set(-w / 2, h / 2, 0);
    leftWall.receiveShadow = true;
    roomGroup.add(leftWall);

    const gridHelper = new THREE.GridHelper(Math.max(w, d) * 2, 40, 0x334155, 0x1e293b);
    gridHelper.position.y = 0.001;
    roomGroup.add(gridHelper);
}

function addProKitchenModule(w_mm, h_mm, d_mm, type) {
    const w = w_mm / 1000;
    const h = h_mm / 1000;
    const d = d_mm / 1000;

    const module = new THREE.Group();

    // 1. SOL DİKME
    const sideGeo = new THREE.BoxGeometry(thickness, h, d);
    const leftSide = new THREE.Mesh(sideGeo, bodyMaterial);
    leftSide.position.set(-w/2 + thickness/2, h/2, 0);
    leftSide.castShadow = true; leftSide.receiveShadow = true;
    module.add(leftSide);

    // 2. SAĞ DİKME
    const rightSide = leftSide.clone();
    rightSide.position.x = w/2 - thickness/2;
    module.add(rightSide);

    // 3. ALT TABAN
    const bottomWidth = w - (thickness * 2);
    const bottomGeo = new THREE.BoxGeometry(bottomWidth, thickness, d - 0.02);
    const bottomPanel = new THREE.Mesh(bottomGeo, bodyMaterial);
    bottomPanel.position.set(0, thickness/2 + 0.1, 0.01);
    bottomPanel.castShadow = true; bottomPanel.receiveShadow = true;
    module.add(bottomPanel);

    // 4. ÜST BAĞLANTI KAYITLARI
    const stretcherGeo = new THREE.BoxGeometry(bottomWidth, thickness, 0.1);
    const topStretcherFront = new THREE.Mesh(stretcherGeo, bodyMaterial);
    topStretcherFront.position.set(0, h - thickness/2, d/2 - 0.05);
    module.add(topStretcherFront);

    // 5. CEPHE / KAPAK (2mm imalat boşluğu hesaplanarak)
    const reveal = 0.002;
    const doorW = w - (reveal * 2);
    const doorH = h - 0.1 - (reveal * 2);
    
    const doorGeo = new THREE.BoxGeometry(doorW, doorH, 0.018);
    const door = new THREE.Mesh(doorGeo, facadeMaterial);
    door.position.set(0, 0.1 + doorH/2 + reveal, d/2 + 0.009);
    door.castShadow = true;
    module.add(door);

    // Kapak Konturu
    const edgeGeo = new THREE.BoxGeometry(doorW + 0.001, doorH + 0.001, 0.019);
    const edges = new THREE.Mesh(edgeGeo, edgeMaterial);
    edges.position.copy(door.position);
    module.add(edges);

    // 6. KULP
    if(type !== 'sink') {
        const handleGeo = new THREE.BoxGeometry(0.015, 0.15, 0.02);
        const handle = new THREE.Mesh(handleGeo, new THREE.MeshStandardMaterial({color: 0x111, metalness:0.9, roughness:0.1}));
        handle.position.set(w/2 - 0.05, 0.1 + doorH/2, d/2 + 0.02);
        module.add(handle);
    }

    // YERLEŞİM ALGORİTMASI
    const count = modulesGroup.children.length;
    let targetX = - (currentRoom.w / 2000) + (w / 2) + (count * 0.602);
    let targetZ = - (currentRoom.d / 2000) + (d / 2);
    let targetY = 0;

    if(type === 'upper_door') {
        targetY = 1.45;
        targetZ = - (currentRoom.d / 2000) + (d / 2) + 0.24;
        leftSide.position.y = h/2;
        rightSide.position.y = h/2;
        bottomPanel.position.y = thickness/2; 
        door.position.y = h/2;
        edges.position.y = h/2;
    }

    module.position.set(targetX, targetY, targetZ);
    
    module.scale.set(0.01, 0.01, 0.01);
    modulesGroup.add(module);

    let s = 0.01;
    function animateSpawn() {
        if(s < 1) {
            s += 0.1;
            module.scale.set(s,s,s);
            requestAnimationFrame(animateSpawn);
        } else {
            module.scale.set(1,1,1);
        }
    }
    animateSpawn();
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
