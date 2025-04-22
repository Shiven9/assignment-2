// Scene Initialization
const canvas = document.getElementById("renderCanvas");
const engine = new BABYLON.Engine(canvas, true);

// Creating the scene
const createScene = async () => {
  const scene = new BABYLON.Scene(engine);

  // try and catch method to see if the WebXR initializes
  try {
    // Enable WebXR VR experience
    // await XR setup to ensure proper initialization
    const xrExperience = await scene.createDefaultXRExperienceAsync();
    console.log("WebXR Initialized", xrExperience);
  } catch (error) {
    console.error("Failed to initialize WebXR:", error);
  }

  // Setting up the camera
  // adjusted camera for better view of the model
  const camera = new BABYLON.ArcRotateCamera(
    "camera",
    Math.PI / 2,
    Math.PI / 3,
    60, // increases radius
    new BABYLON.Vector3(0, 2, 0),
    scene
  );
  camera.attachControl(canvas, true);

  // Lighting for illumination of the scene
  const light = new BABYLON.HemisphericLight(
    "light",
    new BABYLON.Vector3(1, 1, 0),
    scene
  );

  // Load Environment Models
  const environments = {
    beach: { model: "media/beach.obj", sound: "media/beach-sound.mp3" },
    forest: { model: "media/forest.obj", sound: "media/forest-sound.mp3" },
    mountain: {
      model: "media/mountain.obj",
      sound: "media/mountain-sound.mp3",
    },
  };

  let currentEnvironment = [];
  let ambientSound = new BABYLON.Sound(
    "ambientSound",
    environments.beach.sound,
    scene,
    null,
    { loop: true, autoplay: false }
  ); // sound doesn't play when environment is loading, it plays on the first click

  // Function to switch environments
  const loadEnvironment = (env) => {
    // Dispose of the current environment to prevent overlapping of different scenes
    if (currentEnvironment.length > 0) {
      currentEnvironment.forEach((mesh) => mesh.dispose());
    }

    // Loading new environment model
    BABYLON.SceneLoader.ImportMesh(
      "",
      "",
      environments[env].model,
      scene,
      (meshes) => {
        if (meshes.length > 0) {
          currentEnvironment = meshes;

          // Adjusting model size and rescaling it to prevent oversized objects
          meshes.forEach((mesh) => {
            mesh.scaling = new BABYLON.Vector3(0.1, 0.1, 0.1);
            mesh.position = new BABYLON.Vector3(0, 0, 0);
          });
        } else {
          console.error("Failed to load environment model:", env);
        }
      },
      // fixed up the callback error
      null,
      (error) => {
        console.error("Error loading mesh:", error);
      }
    );

    // Stoping previous sound if it is playing
    if (ambientSound) {
      ambientSound.stop();
      ambientSound.dispose(); // Disposing the previous sound to free up the resources
    }

    // Load and play new sound
    ambientSound = new BABYLON.Sound(
      "ambientSound",
      environments[env].sound,
      scene,
      () => {
        ambientSound.play(); // Starts playing the sound when an environment is clicked
      },
      {
        loop: true,
        autoplay: false, // Doesn't autoplay and wait for user to click
      }
    );
  };

  // Environment Selection Buttons
  Object.keys(environments).forEach((env, index) => {
    const button = BABYLON.MeshBuilder.CreateBox(
      env + "Button",
      { height: 0.5, width: 2, depth: 0.2 }, // Reduced the size of the button
      scene
    );
    button.position = new BABYLON.Vector3(-6, 2 - index * 1.5, 4); // adjusted positioning of the buttons

    const material = new BABYLON.StandardMaterial(env + "Material", scene);
    material.diffuseColor = new BABYLON.Color3(
      Math.random(),
      Math.random(),
      Math.random()
    );
    button.material = material;

    const dynamicTexture = new BABYLON.DynamicTexture(
      "dynamicTexture",
      { width: 512, height: 256 },
      scene
    );
    dynamicTexture.hasAlpha = true;
    dynamicTexture.drawText(
      env.toUpperCase(),
      null,
      140,
      "bold 48px Roboto, sans-serif", //Reduced font size and changed the font
      "white",
      "transparent"
    );

    // Text was flipped and was upside down.
    dynamicTexture.uScale = -1; // This should fix it

    material.diffuseTexture = dynamicTexture;

    // Makes the buttons interactive
    button.actionManager = new BABYLON.ActionManager(scene);
    button.actionManager.registerAction(
      new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnPickTrigger, () =>
        loadEnvironment(env)
      )
    );
  });

  // Load initial environment
  loadEnvironment("beach");

  return scene;
};

// Initialize Scene
(async () => {
  const scene = await createScene();
  engine.runRenderLoop(() => scene.render());
})();

// Handle Window Resize
window.addEventListener("resize", () => engine.resize());
