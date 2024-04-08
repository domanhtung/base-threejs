/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
// const char = require("../model/char_1.fbx");
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
// import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader";
const char = require("../model/char_3.glb");

const LoadModal3D = () => {
  const bodyRef = useRef<any>();
  const [scene, setScene] = useState<THREE.Scene | undefined>();
  const [camera, setCamera] = useState<THREE.Camera | undefined>();
  const [renderer, setRenderer] = useState<THREE.WebGLRenderer | undefined>();

  const renderThreeJs = () => {
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

      //   const light = new THREE.AmbientLight(0xffffff);
      //   _scene.add(light);

      //create a blue LineBasicMaterial
      const material = new THREE.LineBasicMaterial({ color: 0x0000ff });
      //After material we will need a geometry with some vertices:
      const points = [];
      //   points.push(new THREE.Vector3(-10, 0, 0));
      points.push(new THREE.Vector3(-10, 0, 0));
      points.push(new THREE.Vector3(0, 10, 0));
      points.push(new THREE.Vector3(10, 0, 0));

      const geometry = new THREE.BufferGeometry().setFromPoints(points);
      //create line
      const _line = new THREE.Line(geometry, material);
      _scene.add(_line);

      const light = new THREE.PointLight(0xffffff, 100, 1000);
      light.position.set(0, 10, 0);
      light.castShadow = true;
      _scene.add(light);

      _renderer.render(_scene, _camera);

      setScene(_scene);
      setCamera(_camera);
      setRenderer(_renderer);
    }
  };

  useEffect(() => {
    renderThreeJs();
  }, []);

  const renderCharacter = () => {
    if (renderer && scene && camera) {
      // Instantiate a loader
      const loader = new GLTFLoader();
      //../../public/model/char_1.fbx
      loader.load(
        // "/public/model/char_1.fbx",
        // "../../public/model/char_1.fbx",
        // "../model/char_3.glb",
        char,
        function (gltf) {
          gltf.scene.traverse(function (child) {
            if ((child as THREE.Mesh).isMesh) {
              const m = child as THREE.Mesh;
              m.receiveShadow = true;
              m.castShadow = true;
            }
            if ((child as THREE.Light).isLight) {
              const l = child as THREE.SpotLight;
              l.castShadow = true;
              l.shadow.bias = -0.003;
              l.shadow.mapSize.width = 2048;
              l.shadow.mapSize.height = 2048;
            }
          });
          scene.add(gltf.scene);
          gltf.scene.scale.set(50, 50, 50);
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
  };

  animate();

  return <div ref={bodyRef} />;
};

export default LoadModal3D;
