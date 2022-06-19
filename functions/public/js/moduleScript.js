var storageRef;
var database;
var camera, scene, renderer, control, loader_font;
var isMouseDown = false,
    onPointerDownMouseX = 0,
    onPointerDownMouseY = 0,
    lon = 0,
    onPointerDownLon = 0,
    lat = 0,
    onPointerDownLat = 0,
    phi = 0,
    theta = 0;
var animationList, avatarMixer;
var loadingScreenDone = false;
const mixers = [];
const clock = new THREE.Clock();
var raycaster, mouse = { x: 0, y: 0 };
var clock2, deltaTime, totalTime, keyboard;
const refGeometry = new THREE.BoxGeometry(0.1, 0.1, 0.1);
const refMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
const refCube = new THREE.Mesh(refGeometry, refMaterial);

firebaseConfigure();


$("#openLibraryModal").on("show.bs.modal", function (e) {
    document.removeEventListener("mousewheel", onDocumentMouseWheel, false);
});

$("#openLibraryModal").on("hidden.bs.modal", function (e) {
    document.addEventListener("mousewheel", onDocumentMouseWheel, false);
});

// Event Listeners for Model Transformations
//rotate
$("#r").click(function () {
    control.visible = true;
    control.setMode("rotate");
});

//translate
$("#t").click(function () {
    control.visible = true;
    control.setMode("translate");
});

//scale
$("#s").click(function () {
    control.visible = true;
    control.setMode("scale");
});

// submit Model Click
$("#submitLibrary").click(function (event) {
    document.getElementById("real-upload").click();
});

// Add Model to scene
$(document).on("click", ".add-element", function (event) {
    // to load Models in front of user at a distance of 0.3 units
    var cwd = new THREE.Vector3();
    camera.getWorldDirection(cwd);
    cwd.multiplyScalar(0.3);
    cwd.add(camera.position);

    // Calling Load Model Function
    loadModels(
        event.target.dataset.name,
        cwd.x,
        cwd.y,
        cwd.z,
        camera.quaternion.x,
        camera.quaternion.y,
        camera.quaternion.z,
        camera.quaternion.w,
        1,
        1,
        1,
        event.target.dataset.id,
    );
    $("#openLibraryModal").modal("hide");
});

// Ready for UI Load
$(document).ready(function () {
    $('.toolbar-btn-main').show();
    $(".toolbar-btn-dynamic").hide();
});



//funtion to load models------.gltf or .glb models
//@param url ----firebase remote url of object
//@param px,py,pz ----translate positions
//@param qx,qy,qz,qw -----quaternion rotations
//@param sx,sy,sz ------scale values
//@param modelName - name with which model is referenced in the scene
function loadModels(
    url,
    px,
    py,
    pz,
    qx,
    qy,
    qz,
    qw,
    sx,
    sy,
    sz,
    modelName,
) {
    refCube.scale.set(1, 1, 1);
    var path = url;
    const loader = new THREE.GLTFLoader();
    const onLoad = (gltf, position) => {
        const model = gltf.scene;
        model.traverse(function (node) {
            if (node.isMesh || node.isLight) node.castShadow = true;
            if (node.isMesh || node.isLight) node.receiveShadow = true;
        });

        const animation = gltf.animations[0];
        const mixer = new THREE.AnimationMixer(model);
        mixers.push(mixer);
        if (animation) {
            const action = mixer.clipAction(animation);
            action.play();
        }

        var allParent = new THREE.Object3D();
        allParent.name = "allParent";
        for (var child in model.children) {
            allParent.add(model.children[child]);
        }
        model.children = [];
        model.add(allParent);
        var bounds = new THREE.Box3();
        bounds.setFromObject(model);
        var boundsSize = new THREE.Vector3();
        bounds.getSize(boundsSize);

        var refBounds = new THREE.Box3();
        refBounds.setFromObject(refCube);
        var refBoundsSize = new THREE.Vector3();
        refBounds.getSize(refBoundsSize);

        var newScale = new THREE.Vector3();
        newScale = new THREE.Vector3(
            refBoundsSize.x / boundsSize.x,
            refBoundsSize.y / boundsSize.y,
            refBoundsSize.z / boundsSize.z,
        );

        var scale = Math.min(newScale.x, newScale.y, newScale.z);
        allParent.scale.set(scale, scale, scale);

        var newBounds = new THREE.Box3();
        newBounds.setFromObject(model);
        var center = new THREE.Vector3();
        newBounds.getCenter(center);
        allParent.position.sub(model.worldToLocal(center));
        const group = new THREE.Object3D();
        var customData = { type: "3DModel" };
        group.userData = customData;
        group.name = modelName;
        group.add(model);
        group.scale.set(sx, sy, sz);
        group.position.set(px, py, pz);
        group.quaternion.set(qx, qy, qz, qw);
        var modelLight = new THREE.DirectionalLight(0xffffff, 1);
        group.add(modelLight);
        scene.add(group);
    };
    // the loader will report the loading progress to this function
    const onProgress = (xhr) => {
        $("#model_load_bar_container").show();
        var current = parseInt((xhr.loaded / xhr.total) * 100);
        current += "%";
        $("#model_load_bar").css("width", current);
        $("#model_load_bar_percent").text(current);

        if (xhr.loaded == xhr.total) {
            $("#model_load_bar").css("width", "0%");
            $("#model_load_bar_container").hide();
        }
    };
    // the loader will send any error messages to this function, and we'll log them to to console
    const onError = (errorMessage) => {
        alert(errorMessage);
    };
    // load the first model. Each model is loaded asynchronously,
    const position = new THREE.Vector3(px, py, pz);
    loader.load(path, (gltf) => onLoad(gltf, position), onProgress, onError);
}

// function to delete model
function deleteModels(modelName) {
    if (control.object && control.object.name == modelName) {
        control.detach();
        $(".toolbar-btn-dynamic").hide();
        $(".toolbar-btn-main").show();
    }
    scene.remove(scene.getObjectByName(modelName));
}

// UI for populating Models
const libTile = (
    tileName,
    link,
    id,
    name,
    className
) => `<div data-id=${id} title="${name}" data-name="${tileName}" data-link="${link}" id="type_${id}" class="tile lib-tile">
        <div class="lib-image">
        <div data-name="${tileName}" data-id="${name}" class="${className ? className : "add-element"}"><img style="pointer-events: none" src="/images/blackplus.svg">Add</div>
        <img src="${link}" class="tile-image">
        </div>
        <div class="lib-tile-text"  title="${name}" style="text-align: center;">${name ? name : ""}</div>
        </div>`;

function populateLibrary() {
    //ObjectRef For Models Folder
    storageRef
        .listAll()
        .then(function (res) {
            res.items.forEach(function (itemRef) {
                let name = itemRef.location.path_.split("/");
                name = name[name.length - 1].split(".")[0];
                itemRef.getDownloadURL().then(function (url) {
                    document.querySelector("#tab-body-saved").innerHTML += libTile(url, "https://static.thenounproject.com/png/997223-200.png", name, name, null);
                }).catch(function (error) {
                    console.log("Error in Getting Object URL")
                });
            });
        })
        .catch(function (error) {
            console.log("Error in listing firebase objects");
        });
}
function init() {
    populateLibrary();
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(
        60,
        window.innerWidth / window.innerHeight,
        0.01,
        1000000,
    );
    camera.position.set(-1.4, 1.5, 5);
    camera.quaternion.set(0, -0.15, 0, 1);
    renderer = new THREE.WebGLRenderer({
        antialias: true,
        canvas: document.querySelector("canvas.webgl")
    });


    const ambientLight = new THREE.AmbientLight("#ffffff", 1.7);
    scene.add(ambientLight);
    const dirLight = new THREE.DirectionalLight("#ffffff", 2);
    dirLight.castShadow = true; // default false
    dirLight.position.set(0, 10, 0);
    scene.add(dirLight);

    const loader = new THREE.GLTFLoader();
    const onLoad = (gltf, position) => {
        const model = gltf.scene;
        model.traverse(function (node) {
            if (node.isMesh || node.isLight) node.castShadow = true;
            if (node.isMesh || node.isLight) node.receiveShadow = true;
        });
        model.position.set(0, 0, 0);
        model.name = "threejsScene";
        model.visible = true;
        scene.add(model);
    };
    // the loader will report the loading progress to this function
    const onProgress = (xhr) => {
        var current = parseInt((xhr.loaded / xhr.total) * 100);
        current += "%";
        if (xhr.loaded == xhr.total) {
            const loaderSky = new THREE.TextureLoader();
            const textureSky = loaderSky.load("/images/sky3.jpg", () => {
                const rt = new THREE.WebGLCubeRenderTarget(textureSky.image.height);
                rt.fromEquirectangularTexture(renderer, textureSky);
                scene.background = rt.texture;
            });
            renderer.outputEncoding = THREE.sRGBEncoding;
            renderer.physicallyCorrectLights = true;
            renderer.toneMapping = THREE.ACESFilmicToneMapping;
            $("#overlay").fadeIn();
        }
    };
    // the loader will send any error messages to this function, and we'll log them to to console
    const onError = (errorMessage) => {
        alert(errorMessage);
    };
    // load the first model. Each model is loaded asynchronously,
    const position = new THREE.Vector3(0, 0, 0);
    loader.load(
        "https://firebasestorage.googleapis.com/v0/b/arpitdemo26.appspot.com/o/threejsScene.glb?alt=media&token=42f0f8f8-12d4-4981-a84e-0326354c70fa",
        (gltf) => onLoad(gltf, position),
        onProgress,
        onError
    );

    raycaster = new THREE.Raycaster();

    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap; // default THREE.PCFShadowMap
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.domElement.addEventListener("click", raycast, false);
    document.body.appendChild(renderer.domElement);
    window.addEventListener("resize", onWindowResize, false);

    // for Camera Movements with Keyboard
    clock2 = new THREE.Clock();
    deltaTime = 0;
    totalTime = 0;

    keyboard = new Keyboard();

    control = new THREE.TransformControls(camera, renderer.domElement);
    scene.add(control);
    control.setSize(0.8);

    document.addEventListener("mousemove", onDocumentMouseMove, false);
    document.addEventListener("mousedown", onDocumentMouseDown, false);
    document.addEventListener("mouseup", onDocumentMouseUp, false);
    document.addEventListener("mousewheel", onDocumentMouseWheel, false);
}

$(document).on("mouseover", ".custom-tooltip", function (event) {
    const pos = event.target.getBoundingClientRect();
    $(this).parent().append(`<div class="tool-tip-custom" id="${$(this).attr("tooltipTitle").split(" ").join("")}-tool" style="transform: translateY(-50px)">
        <div style="position: relative;display: flex;justify-content: center;align-items: center;">
            ${$(this).attr("tooltipTitle")}
            <div class="triangle"></div>
        </div>
    </div>`);
});

$(document).on("mouseleave", ".custom-tooltip", function (event) {
    $(`#${$(this).attr("tooltipTitle").split(" ").join("")}-tool`).remove();
});



async function raycast(e) {
    //1. sets the mouse position with a coordinate system where the center of the screen is the origin
    mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;

    //2. set the picking ray from the camera position and mouse coordinates
    raycaster.setFromCamera(mouse, camera);

    //3. compute intersections
    var intersects = raycaster.intersectObjects(scene.children, true);

    for (var i = 0; i < intersects.length; i++) {
        if (intersects[i].object.type == "Mesh") {
            document.removeEventListener("mousemove", onDocumentMouseMove, false);
            document.removeEventListener("mousedown", onDocumentMouseDown, false);
            document.removeEventListener("mouseup", onDocumentMouseUp, false);
            document.removeEventListener("mousewheel", onDocumentMouseWheel, false);
            var internalObject = intersects[i].object;
            while (internalObject["type"] != "Scene" && internalObject["type"] != "Group") {
                internalObject = internalObject.parent;
            }
            if (internalObject.type == "Group" && internalObject.parent.userData.type == "3DModel") {
                $(".toolbar-btn-main, .toolbar-btn-dynamic").hide();
                $('.toolbar-btn-trsds').show();
                $('.toolbar-btn-model').show();

                $("#x").off("click");
                var selectedModel = scene.getObjectByName(internalObject.parent.name);
                control.detach();
                control.attach(selectedModel);
                control.visible = false;
                $("#x").click(function () {
                    deleteModels(internalObject.parent.name);
                });
                break;
            }
        }
        if (i == intersects.length - 1) {
            document.addEventListener("mousemove", onDocumentMouseMove, false);
            document.addEventListener("mousedown", onDocumentMouseDown, false);
            document.addEventListener("mouseup", onDocumentMouseUp, false);
            document.addEventListener("mousewheel", onDocumentMouseWheel, false);
            $(".toolbar-btn-dynamic").hide();
            $(".toolbar-btn-main").show();
            if (control.object) {
                control.detach();
            }
        }
    }
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
    requestAnimationFrame(animate);
    deltaTime = clock2.getDelta();
    totalTime += deltaTime;
    update();
    renderer.render(scene, camera);
}


function update() {
    const delta = clock.getDelta();
    if (avatarMixer != null) {
        avatarMixer.update(delta);
    }
    for (const mixer of mixers) {
        mixer.update(delta);
    }

    keyboard.update();

    let translateSpeed = 1; // units per second
    let distance = translateSpeed * deltaTime;
    let rotateSpeed = Math.PI / 4; // radians per second
    let angle = rotateSpeed * deltaTime;

    if (keyboard.isKeyPressed("ArrowUp")) {
        camera.translateZ(-distance);
        camera.position.y = 1.5;
        camera.updateProjectionMatrix();
    }

    if (keyboard.isKeyPressed("ArrowDown")) {
        camera.translateZ(distance);
        camera.position.y = 1.5;
        camera.updateProjectionMatrix();
    }

    if (keyboard.isKeyPressed("ArrowLeft")) {
        camera.translateX(-distance);
        camera.position.y = 1.5;
        camera.updateProjectionMatrix();
    }

    if (keyboard.isKeyPressed("ArrowRight")) {
        camera.translateX(distance);
        camera.position.y = 1.5;
        camera.updateProjectionMatrix();
    }


}


function firebaseConfigure() {
    firebase.initializeApp(firebaseConfig);
    storageRef = firebase.storage().ref("models");
    init();
    animate();

    document.getElementById("real-upload").addEventListener("change", handleFileSelect, false);
    function handleFileSelect(evt) {
        evt.stopPropagation();
        evt.preventDefault();
        var file = evt.target.files[0];
        var fileName = file.name.split(".")[0]

        var metadata = {
            contentType: file.type,
        };

        var uploadTask = storageRef.child("/" + file.name).put(file, metadata);
        uploadTask.on(firebase.storage.TaskEvent.STATE_CHANGED,
            function (snapshot) {
                var progress = parseInt(
                    (snapshot.bytesTransferred / snapshot.totalBytes) * 100,
                );
                progress += "%";
                $("#model_load_bar_container").show();
                $("#model_load_bar").css("width", progress);
                $("#model_load_bar_percent").text(progress);
                console.log((snapshot.bytesTransferred / snapshot.totalBytes * 100) + '% uploaded');
            },
            function (error) {
                switch (error.code) {
                    case "storage/unauthorized":
                        // User doesn't have permission to access the object
                        break;

                    case "storage/canceled":
                        // User canceled the upload
                        break;

                    case "storage/unknown":
                        // Unknown error occurred, inspect error.serverResponse
                        break;
                }
            },
            function () {
                // Upload completed successfully
                $("#model_load_bar").css("width", "0%");
                $("#model_load_bar_percent").text("0%");
                $("#model_load_bar_container").hide();
                // console.log('Upload Completed');
                uploadTask.snapshot.ref.getDownloadURL().then(function (downloadURL) {
                    document.querySelector("#tab-body-saved").innerHTML += libTile(downloadURL, "https://static.thenounproject.com/png/997223-200.png", fileName, fileName, null);
                    swal(
                        "File uploaded Successfully!!",
                        "Uploaded File has been stored on Cloud Server",
                        "success",
                    ).catch(swal.noop);
                    $("#openLibraryModal").modal("hide");

                });

            },
        );
    }
    // end of firebase configure....
}

function onDocumentMouseDown(event) {
    // event.preventDefault();
    isMouseDown = true;
    onPointerDownMouseX = event.clientX;
    onPointerDownMouseY = event.clientY;
    onPointerDownLon = lon;
    onPointerDownLat = lat;
}

function onDocumentMouseMove(event) {
    // event.preventDefault();

    if (isMouseDown) {
        lon = (onPointerDownMouseX - event.clientX) * 0.1 + onPointerDownLon;
        lat = (event.clientY - onPointerDownMouseY) * 0.1 + onPointerDownLat;
        lat = Math.max(-85, Math.min(85, lat));
        phi = THREE.MathUtils.degToRad(90 - lat);
        theta = THREE.MathUtils.degToRad(lon);

        const x = 500 * Math.sin(phi) * Math.cos(theta);
        const y = 500 * Math.cos(phi);
        const z = 500 * Math.sin(phi) * Math.sin(theta);

        camera.lookAt(x, y, z);
        camera.updateProjectionMatrix();
    }
    renderer.render(scene, camera);
}

function onDocumentMouseUp(event) {
    // event.preventDefault();
    isMouseDown = false;
}

function onDocumentMouseWheel(event) {
    // event.preventDefault();
    const fov = camera.fov + event.deltaY * 0.05;
    camera.fov = THREE.MathUtils.clamp(fov, 10, 75);
    camera.updateProjectionMatrix();
}


