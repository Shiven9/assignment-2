// Scene Initialization
const canvas = document.getElementById('renderCanvas');
const engine = new BABYLON.Engine(canvas, true);

// Creating the scene
const createScene = () => {
    const scene = new BABYLON.Scene(engine);

    // Enable WebXR VR experience
    const xrHelper = scene.createDefaultXRExperienceAsync({});

    // Setting up the camera
    const camera = new BABYLON.ArcRotateCamera("camera", Math.PI / 2, Math.PI / 3, 10, BABYLON.Vector3.Zero(), scene);
    camera.attachControl(canvas, true);

    // Lighting for illumination of the scene
    const light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(1, 1, 0), scene);

    // Load Environment Models
    const environments = {
        beach: { model: "media/beach.obj", sound: "media/beach-sound.mp3" },
        forest: { model: "media/forest.obj", sound: "media/forest-sound.mp3" },
        mountain: { model: "media/mountain.obj", sound: "media/mountain-sound.mp3" },
    };

    let currentEnvironment = null;
    let ambientSound = new BABYLON.Sound("ambientSound", environments.beach.sound, scene, null, { loop: true, autoplay: true });

    // Function to switch environments
    const loadEnvironment = (env) => {
        // Dispose of the current environment to prevent overlapping of different scenes
        if (currentEnvironment) {
            currentEnvironment.forEach(mesh => mesh.dispose());
        }

        // Loading new environment model
        BABYLON.SceneLoader.ImportMesh("", "", environments[env].model, scene, (meshes) => {
            currentEnvironment = meshes[0];

            // Adjusting model size and rescaling it to prevent oversized objects
            meshes.forEach(mesh => {
                mesh.scaling = new BABYLON.Vector3(0.1, 0.1, 0.1);
                mesh.position = new BABYLON.Vector3(0, 0, 0);
            });
        });

        // Stopping the previous sound to play the new one
        ambientSound.stop();
        ambientSound = new BABYLON.Sound("ambientSound", environments[env].sound, scene, null, { loop: true, autoplay: true });
    };

    // Environment Selection Buttons
    Object.keys(environments).forEach((env, index) => {
        const button = BABYLON.MeshBuilder.CreateBox(env + "Button", { height: 1, width: 3, depth: 0.2 }, scene);
        button.position = new BABYLON.Vector3(index * 4 - 4, 0, 5);

        const material = new BABYLON.StandardMaterial(env + "Material", scene);
        material.diffuseColor = new BABYLON.Color3(Math.random(), Math.random(), Math.random());
        button.material = material;

        const dynamicTexture = new BABYLON.DynamicTexture("dynamicTexture", { width: 512, height: 256 }, scene);
        dynamicTexture.drawText(env.toUpperCase(), null, 140, "bold 72px Arial", "white", "transparent");
        material.diffuseTexture = dynamicTexture;

        button.actionManager = new BABYLON.ActionManager(scene);
        button.actionManager.registerAction(
            new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnPickTrigger, () => loadEnvironment(env))
        );
    });

    // Load initial environment
    loadEnvironment("beach");

    return scene;
};

// Initialize Scene
const scene = createScene();
engine.runRenderLoop(() => scene.render());

// Handle Window Resize
window.addEventListener('resize', () => engine.resize());
