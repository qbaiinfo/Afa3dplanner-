// --- DİL ÇEVİRİ PAKETLERİ (RU / KK) ---
const translations = {
    ru: {
        room_settings: "Размеры помещения (мм)",
        width: "Ширина (X):",
        depth: "Глубина (Z):",
        height: "Высота (Y):",
        update_btn: "Обновить комнату"
    },
    kk: {
        room_settings: "Бөлме өлшемдері (мм)",
        width: "Ені (X):",
        depth: "Тереңдігі (Z):",
        height: "Биіктігі (Y):",
        update_btn: "Бөлмені жаңарту"
    }
};

let currentLang = 'ru';

function switchLanguage(lang) {
    currentLang = lang;
    
    // Dil butonlarının aktiflik durumunu güncelle
    document.querySelectorAll('.lang-btn').forEach(btn => btn.classList.remove('active'));
    
    // Tıklanan butona aktiflik sınıfı ekle
    if(event && event.target) {
        event.target.classList.add('active');
    }

    // Arayüzdeki metinleri değiştir
    document.querySelectorAll('[data-lang-key]').forEach(element => {
        const key = element.getAttribute('data-lang-key');
        if (translations[lang][key]) {
            element.innerText = translations[lang][key];
        }
    });
}

// --- THREE.JS KURULUMU ---
const container = document.getElementById('canvas-container');
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x222222);

const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(4, 5, 6); 

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
container.appendChild(renderer.domElement);

const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.maxPolarAngle = Math.PI / 2 - 0.05;

// --- IŞIKLAR ---
const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
scene.add(ambientLight);

const dirLight = new THREE.DirectionalLight(0xffffff, 0.5);
dirLight.position.set(5, 10, 7);
dirLight.castShadow = true;
scene.add(dirLight);

// --- DİNAMİK ODA ÇİZİMİ ---
let roomGroup = new THREE.Group();
scene.add(roomGroup);

function drawRoom(width, depth, height) {
    while(roomGroup.children.length > 0){ 
        roomGroup.remove(roomGroup.children[0]); 
    }

    const w = width / 1000;
    const d = depth / 1000;
    const h = height / 1000;

    const floorMat = new THREE.MeshStandardMaterial({ color: 0xbc9b70, roughness: 0.5 });
    const wallMat = new THREE.MeshStandardMaterial({ color: 0xf5f5f5, roughness: 0.8 });

    // Zemin
    const floorGeo = new THREE.PlaneGeometry(w, d);
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    roomGroup.add(floor);

    // Arka Duvar
    const backWallGeo = new THREE.PlaneGeometry(w, h);
    const backWall = new THREE.Mesh(backWallGeo, wallMat);
    backWall.position.set(0, h / 2, -d / 2);
    roomGroup.add(backWall);

    // Sol Duvar
    const leftWallGeo = new THREE.PlaneGeometry(d, h);
    const leftWall = new THREE.Mesh(leftWallGeo, wallMat);
    leftWall.rotation.y = Math.PI / 2;
    leftWall.position.set(-w / 2, h / 2, 0);
    roomGroup.add(leftWall);
    
    // Kılavuz Izgarası (Grid)
    const gridHelper = new THREE.GridHelper(Math.max(w, d) * 2, 20, 0x888888, 0x444444);
    gridHelper.position.y = 0.01;
    roomGroup.add(gridHelper);
}

function updateRoomDimensions() {
    const w = parseFloat(document.getElementById('room-width').value);
    const d = parseFloat(document.getElementById('room-depth').value);
    const h = parseFloat(document.getElementById('room-height').value);
    drawRoom(w, d, h);
}

// İlk çizim
drawRoom(3200, 4000, 2500);

// --- ANIMASYON DÖNGÜSÜ ---
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
