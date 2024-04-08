/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import { OutputPass } from "three/examples/jsm/postprocessing/OutputPass.js";
import { GUI } from "three/examples/jsm/libs/lil-gui.module.min.js";
const char = require("../model/phone.glb");

const Phone = () => {
  const bodyRef = useRef<any>();
  const [scene, setScene] = useState<THREE.Scene | undefined>();
  const [camera, setCamera] = useState<THREE.Camera | undefined>();
  const [renderer, setRenderer] = useState<THREE.WebGLRenderer | undefined>();
  const [composer, setComposer] = useState<EffectComposer | undefined>();

  const init = () => {
    if (bodyRef && !bodyRef?.current?.children?.length) {
      //create scene
      const _scene = new THREE.Scene();
      const _camera = new THREE.PerspectiveCamera(
        75,
        window?.innerWidth / window?.innerHeight,
        0.1,
        1000
      );
      _camera?.position.set(10, 10, 10);
      _camera?.lookAt(0, 0, 0);
      const _renderer = new THREE.WebGLRenderer();
      _renderer.setSize(window?.innerWidth, window?.innerHeight);
      bodyRef?.current?.appendChild(_renderer.domElement);
      _scene.fog = new THREE.FogExp2(0xcccccc, 0.002);
      // _scene.background = new THREE.Color(256, 256, 256);

      const controls = new OrbitControls(_camera, _renderer.domElement);
      controls.enableDamping = true;

      const light = new THREE.PointLight(0xffffff, 100, 1000);
      light.position.set(10, 10, 10);
      light.castShadow = true;
      _scene.add(light);

      const params = {
        threshold: 0,
        strength: 1,
        radius: 0,
        exposure: 1,
      };

      const _renderScene = new RenderPass(_scene, _camera);

      const _bloomPass = new UnrealBloomPass(
        new THREE.Vector2(window.innerWidth, window.innerHeight),
        1.5,
        0.4,
        0.85
      );
      _bloomPass.threshold = params.threshold;
      _bloomPass.strength = params.strength;
      _bloomPass.radius = params.radius;

      const outputPass = new OutputPass();

      let _composer = new EffectComposer(_renderer);
      _composer.addPass(_renderScene);
      _composer.addPass(_bloomPass);
      _composer.addPass(outputPass);

      const _gui = new GUI();

      const bloomFolder = _gui.addFolder("bloom");

      bloomFolder.add(params, "threshold", 0.0, 1.0).onChange(function (value) {
        _bloomPass.threshold = Number(value);
      });

      bloomFolder.add(params, "strength", 0.0, 3.0).onChange(function (value) {
        _bloomPass.strength = Number(value);
      });

      _gui
        .add(params, "radius", 0.0, 1.0)
        .step(0.01)
        .onChange(function (value) {
          _bloomPass.radius = Number(value);
        });

      const toneMappingFolder = _gui.addFolder("tone mapping");

      toneMappingFolder
        .add(params, "exposure", 0.1, 2)
        .onChange(function (value) {
          _renderer.toneMappingExposure = Math.pow(value, 4.0);
        });

      _renderer.render(_scene, _camera);

      setScene(_scene);
      setCamera(_camera);
      setRenderer(_renderer);
      setComposer(_composer);
    }
  };

  useEffect(() => {
    init();
  }, []);

  const renderCharacter = () => {
    if (renderer && scene && camera) {
      // Instantiate a loader
      const loader = new GLTFLoader();
      loader.load(
        char,
        function (gltf) {
          scene.add(gltf.scene);
          renderer.render(scene, camera);
        },
        undefined,
        function (error) {
          console.error(error);
        }
      );
    }
  };

  useEffect(() => {
    renderCharacter();
  }, [renderer, scene, camera]);

  const animate = () => {
    requestAnimationFrame(animate);
    if (renderer && scene && camera) {
      renderer?.render(scene, camera);
    }
    if (composer) {
      composer.render();
    }
  };

  animate();

  return <div ref={bodyRef} />;
};

export default Phone;
