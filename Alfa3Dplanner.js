// --- DİL MAPPING ---
const translations = {
    ru: {
        tab_room: "ПОМЕЩЕНИЕ", tab_modules: "МОДУЛИ",
        room_settings: "Размеры помещения (мм)", width: "Ширина (X):", depth: "Глубина (Z):", height: "Высота (Y):",
        lower_modules: "Нижние базы (Напольные)", upper_modules: "Верхние шкафы (Навесные)",
        m1: "Нижний шкаф с полками", m2: "Шкаф под мойку", m3: "Верхний навесной шкаф",
        editor_title: "Свойства выбранного модуля",
        mod_w: "Ширина (мм):", mod_h: "Высота (мм):", mod_d: "Глубина (мм):", mod_shelves: "Кол-во полок:",
        mod_pos: "Позиция по стене:", delete_btn: "Удалить модуль"
    },
    kk: {
        tab_room: "БӨЛМЕ", tab_modules: "МОДУЛЬДЕР",
        room_settings: "Бөлме өлшемдері (мм)", width: "Ені (X):", depth: "Тереңдігі (Z):", height: "Биіктігі (Y):",
        lower_modules: "Төменгі базалар (Едендік)", upper_modules: "Жоғарғы шкафтар (Аспалы)",
        m1: "Сөрелері бар төменгі шкаф", m2: "Жуғыш шкафы", m3: "Жоғарғы аспалы шкаф",
        editor_title: "Таңдалған модуль қасиеттері",
        mod_w: "Ені (мм):", mod_h: "Биіктігі (мм):", mod_d: "Тереңдігі (мм):", mod_shelves: "Сөрелер саны:",
        mod_pos: "Қабырға бағыты:", delete_btn: "Модульді өшіру"
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
    document.getElementById('lbl-lower-modules').innerText = t.lower_modules;
    document.getElementById('lbl-upper-modules').innerText = t.upper_modules;
    document.getElementById('lbl-m1').innerText = t.m1;
    document.getElementById('lbl-m2').innerText = t.m2;
    document.getElementById('lbl-m3').innerText = t.m3;
    document.getElementById('lbl-editor-title').innerText = t.editor_title;
    document.getElementById('lbl-mod-w').innerText = t.mod_w;
    document.getElementById('lbl-mod-h').innerText = t.mod_h;
    document.getElementById('lbl-mod-d').innerText = t.mod_d;
    document.getElementById('lbl-mod-shelves').innerText = t.mod_shelves;
    document.getElementById('lbl-mod-pos').innerText = t.mod_pos;
    document.getElementById('btn-delete').innerText = t.delete_btn;
}

function switchTab(tabId) {
    document.getElementById('btn-tab-room').classList.remove('active');
    document.getElementById('btn-tab-modules').classList.remove('active');
    document.getElementById('tab-room').classList.remove('active');
    document.getElementById('tab-modules').classList.remove('active');
    document.getElementById('btn-tab-' + tabId).classList.add('active');
    document.getElementById('tab-' + tabId).classList.add('active');
}

// --- THREE.JS ENGINE PRO V4 ---
const container = document.getElementById('canvas-container');
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0b0f19);

const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(4, 4, 6);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.3;
container.appendChild(renderer.domElement);

const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.maxPolarAngle = Math.PI / 2 - 0.02;

// LIGHTS
scene.add(new THREE.AmbientLight(0xffffff, 0.45));
const mainLight = new THREE.DirectionalLight(0xffffff, 0.85);
mainLight.position.set(8, 15, 10);
mainLight.castShadow = true;
mainLight.shadow.mapSize.width = 2048;
mainLight.shadow.mapSize.height = 2048;
mainLight.shadow.bias = -0.0004;
scene.add(mainLight);

const fillLight = new THREE.DirectionalLight(0xbae6fd, 0.25);
fillLight.position.set(-8, 8, -6);
scene.add(fillLight);

let roomGroup = new THREE.Group();
let modulesGroup = new THREE.Group();
scene.add(roomGroup);
scene.add(modulesGroup);

let currentRoom = { w: 3200, d: 4000, h: 2500 };
const thickness = 0.018; // 18mm Malzeme

// PRO MALZEME TANIMLAMALARI (PBR METALLIC-ROUGHNESS)
const floorMaterial = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.4, metalness: 0.1 });
const wallMaterial = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.9 });
const bodyMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.5 }); // Beyaz Gövde
const facadeMaterial = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.3, metalness: 0.05 }); // Antrasit Mat Lake Kapak
const shelfMaterial = new THREE.MeshStandardMaterial({ color: 0xcbd5e1, roughness: 0.6 }); // Açık gri raf rengi
const selectedMaterial = new THREE.MeshStandardMaterial({ color: 0x2563eb, roughness: 0.2, emissive: 0x1d4ed8, emissiveIntensity: 0.2 }); // Seçim aydınlatması
const edgeMaterial = new THREE.MeshBasicMaterial({ color: 0x475569, wireframe: true });

let selectedModule = null;
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

function drawRoom(width, depth, height) {
    currentRoom = { w: width, d: depth, h: height };
    while(roomGroup.children.length > 0){ roomGroup.remove(roomGroup.children[0]); }

    const w = width / 1000;
    const d = depth / 1000;
    const h = height / 1000;

    const floor = new THREE.Mesh(new THREE.PlaneGeometry(w, d), floorMaterial);
    floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true;
    roomGroup.add(floor);

    const backWall = new THREE.Mesh(new THREE.PlaneGeometry(w, h), wallMaterial);
    backWall.position.set(0, h / 2, -d / 2); backWall.receiveShadow = true;
    roomGroup.add(backWall);

    const leftWall = new THREE.Mesh(new THREE.PlaneGeometry(d, h), wallMaterial);
    leftWall.rotation.y = Math.PI / 2; leftWall.position.set(-w / 2, h / 2, 0); leftWall.receiveShadow = true;
    roomGroup.add(leftWall);

    const gridHelper = new THREE.GridHelper(Math.max(w, d) * 2, 40, 0x334155, 0x1e293b);
    gridHelper.position.y = 0.001; roomGroup.add(gridHelper);
}

// --- DİNAMİK PARAMETRİK MOBİLYA RE-GEN MOTORU ---
function rebuildModuleGeometry(modGroup) {
    // Önce içindeki eski çizimleri temizle
    while(modGroup.children.length > 0) { modGroup.remove(modGroup.children[0]); }

    const w = modGroup.userData.w_mm / 1000;
    const h = modGroup.userData.h_mm / 1000;
    const d = modGroup.userData.d_mm / 1000;
    const numShelves = modGroup.userData.shelves || 0;
    const isSelected = (selectedModule === modGroup);
    
    const activeBodyMat = isSelected ? selectedMaterial : bodyMaterial;

    // 1. SOL DİKME
    const sideGeo = new THREE.BoxGeometry(thickness, h, d);
    const leftSide = new THREE.Mesh(sideGeo, activeBodyMat);
    leftSide.position.set(-w/2 + thickness/2, h/2, 0);
    leftSide.castShadow = true; leftSide.receiveShadow = true;
    modGroup.add(leftSide);

    // 2. SAĞ DİKME
    const rightSide = leftSide.clone();
    rightSide.position.x = w/2 - thickness/2;
    modGroup.add(rightSide);

    // 3. ALT TABAN
    const bottomWidth = w - (thickness * 2);
    const bottomGeo = new THREE.BoxGeometry(bottomWidth, thickness, d - 0.01);
    const bottomPanel = new THREE.Mesh(bottomGeo, activeBodyMat);
    bottomPanel.position.set(0, thickness/2 + (modGroup.userData.type.startsWith('upper') ? 0 : 0.1), 0.005);
    bottomPanel.castShadow = true; bottomPanel.receiveShadow = true;
    modGroup.add(bottomPanel);

    // 4. ÜST BAĞLANTI KAYDI
    const stretcherGeo = new THREE.BoxGeometry(bottomWidth, thickness, 0.1);
    const topStretcher = new THREE.Mesh(stretcherGeo, activeBodyMat);
    topStretcher.position.set(0, h - thickness/2, d/2 - 0.05);
    modGroup.add(topStretcher);

    // 5. İÇ RAF SİSTEMİ (Dinamik Adet Hesaplama)
    if (numShelves > 0) {
        const baseMinY = modGroup.userData.type.startsWith('upper') ? thickness : 0.1 + thickness;
        const availableHeight = h - baseMinY - thickness;
        const step = availableHeight / (numShelves + 1);
        
        for (let i = 1; i <= numShelves; i++) {
            const shelfGeo = new THREE.BoxGeometry(bottomWidth - 0.002, thickness, d - 0.03); // Raf derinliği 3cm içeride
            const shelf = new THREE.Mesh(shelfGeo, shelfMaterial);
            shelf.position.set(0, baseMinY + (step * i), 0.01);
            shelf.castShadow = true; shelf.receiveShadow = true;
            modGroup.add(shelf);
        }
    }

    // 6. ÖN LAK KAPAKLAR VE DERZ HESABI
    const reveal = 0.002;
    const doorW = w - (reveal * 2);
    const doorH = h - (modGroup.userData.type.startsWith('upper') ? 0 : 0.1) - (reveal * 2);
    
    const doorGeo = new THREE.BoxGeometry(doorW, doorH, 0.018);
    const door = new THREE.Mesh(doorGeo, facadeMaterial);
    door.position.set(0, (modGroup.userData.type.startsWith('upper') ? 0 : 0.1) + doorH/2 + reveal, d/2 + 0.009);
    door.castShadow = true;
    modGroup.add(door);

    // Kapak Kenar Çizgileri
    const edgeGeo = new THREE.BoxGeometry(doorW + 0.001, doorH + 0.001, 0.019);
    const edges = new THREE.Mesh(edgeGeo, edgeMaterial);
    edges.position.copy(door.position);
    modGroup.add(edges);

    // 7. KULP (Krom Modern Profil)
    if(modGroup.userData.type !== 'lower_sink') {
        const handleGeo = new THREE.BoxGeometry(0.015, 0.12, 0.02);
        const handle = new THREE.Mesh(handleGeo, new THREE.MeshStandardMaterial({color: 0x111111, metalness: 0.9, roughness: 0.1}));
        handle.position.set(w/2 - 0.04, (modGroup.userData.type.startsWith('upper') ? 0 : 0.1) + doorH/2, d/2 + 0.02);
        modGroup.add(handle);
    }
}

// --- PRO YERLEŞİM VE AUTOMATIC WALL SNAP ALGORİTMASI ---
function autoSnapAndAlignModules() {
    let currentX_back = - (currentRoom.w / 2000);
    let currentZ_left = - (currentRoom.d / 2000);

    modulesGroup.children.forEach((mod) => {
        const w = mod.userData.w_mm / 1000;
        const d = mod.userData.d_mm / 1000;
        const wall = mod.userData.wallAlign || 'back';

        if (wall === 'back') {
            // Arka duvara yasla, yan yana diz (Mıknatıs gibi kenetlenme)
            let targetX = currentX_back + (w / 2);
            let targetZ = - (currentRoom.d / 2000) + (d / 2);
            let targetY = mod.userData.type.startsWith('upper') ? 1.45 : 0;
            
            mod.position.set(targetX, targetY, targetZ);
            mod.rotation.set(0, 0, 0); // Düz duruş
            
            currentX_back += w + 0.002; // 2mm modüller arası emniyet boşluğu
        } else if (wall === 'left') {
            // Sol duvara yasla, köşe dönüş mantığına göre diz
            let targetX = - (currentRoom.w / 2000) + (d / 2);
            let targetZ = currentZ_left + (w / 2);
            let targetY = mod.userData.type.startsWith('upper') ? 1.45 : 0;
            
            mod.position.set(targetX, targetY, targetZ);
            mod.rotation.set(0, Math.PI / 2, 0); // 90 derece dönüş açısı
            
            currentZ_left += w + 0.002;
        }
    });
}

function createNewProModule(type) {
    const modGroup = new THREE.Group();
    
    // Default Değerler (Mms cinsinden parametrik saklama)
    modGroup.userData = {
        type: type,
        w_mm: type === 'lower_sink' ? 800 : 600,
        h_mm: type.startsWith('upper') ? 720 : 820,
        d_mm: type.startsWith('upper') ? 320 : 560,
        shelves: type === 'lower_sink' ? 0 : 2,
        wallAlign: 'back' // Varsayılan arka duvar yerleşimi
    };

    modulesGroup.add(modGroup);
    selectModule(modGroup);
    rebuildModuleGeometry(modGroup);
    autoSnapAndAlignModules();
    
    // Animasyon Giriş Efekti
    modGroup.scale.set(0.1, 0.1, 0.1);
    let s = 0.1;
    function spawn() {
        if(s < 1) { s += 0.15; modGroup.scale.set(s,s,s); requestAnimationFrame(spawn); }
        else { modGroup.scale.set(1,1,1); }
    }
    spawn();
    
    switchTab('room'); // Düzenleme panelini görsün diye odaya atıyoruz
}

// --- SEÇİM & EDİTÖR ETKİLEŞİM MANTIĞI ---
function selectModule(module) {
    if (selectedModule) {
        const oldMod = selectedModule;
        selectedModule = null;
        rebuildModuleGeometry(oldMod); // Eski seçimi normal rengine döndür
    }

    selectedModule = module;
    if (module) {
        rebuildModuleGeometry(module); // Seçileni mavi renkle aydınlat
        
        // Panel Değerlerini doldur
        document.getElementById('props-panel').style.display = 'block';
        document.getElementById('prop-width').value = module.userData.w_mm;
        document.getElementById('prop-height').value = module.userData.h_mm;
        document.getElementById('prop-depth').value = module.userData.d_mm;
        document.getElementById('prop-shelves').value = module.userData.shelves;
        document.getElementById('prop-wall-align').value = module.userData.wallAlign;
    } else {
        document.getElementById('props-panel').style.display = 'none';
    }
}

function applySelectedProps() {
    if (!selectedModule) return;

    selectedModule.userData.w_mm = parseFloat(document.getElementById('prop-width').value) || 600;
    selectedModule.userData.h_mm = parseFloat(document.getElementById('prop-height').value) || 820;
    selectedModule.userData.d_mm = parseFloat(document.getElementById('prop-depth').value) || 560;
    selectedModule.userData.shelves = parseInt(document.getElementById('prop-shelves').value) || 0;
    selectedModule.userData.wallAlign = document.getElementById('prop-wall-align').value;

    rebuildModuleGeometry(selectedModule);
    autoSnapAndAlignModules(); // Boyut değişince jilet gibi tekrar hizala
}

function deleteSelectedModule() {
    if (!selectedModule) return;
    modulesGroup.remove(selectedModule);
    selectModule(null);
    autoSnapAndAlignModules();
}

// MOUSE CLICK RAYCAST DETECTION
window.addEventListener('pointerdown', (e) => {
    // Menüye tıklanma durumunda çalışmasın diye kontrol
    if (e.clientX < 370 && e.clientY > 20) return;

    mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    
    // Modüller altındaki tüm meshleri tara
    const intersects = raycaster.intersectObjects(modulesGroup.children, true);

    if (intersects.length > 0) {
        // En üst seviyedeki Group nesnesini (yani modülü) bulana kadar yukarı çık
        let obj = intersects[0].object;
        while (obj.parent && obj.parent !== modulesGroup) {
            obj = obj.parent;
        }
        selectModule(obj);
    } else {
        selectModule(null); // Boşluğa tıklarsa seçimi kaldır
    }
});

function updateRoomDimensions() {
    const w = parseFloat(document.getElementById('room-width').value);
    const d = parseFloat(document.getElementById('room-depth').value);
    const h = parseFloat(document.getElementById('room-height').value);
    drawRoom(w, d, h);
    autoSnapAndAlignModules();
}

// SETUP INIT
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
