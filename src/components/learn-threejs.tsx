/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";

const LearnThreeJs = () => {
  const bodyRef = useRef<any>();
  const [scene, setScene] = useState<THREE.Scene | undefined>();
  const [camera, setCamera] = useState<THREE.Camera | undefined>();
  const [renderer, setRenderer] = useState<THREE.WebGLRenderer | undefined>();
  const [cube, setCube] = useState<
    | THREE.Mesh<
        THREE.BoxGeometry,
        THREE.MeshBasicMaterial,
        THREE.Object3DEventMap
      >
    | undefined
  >();

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
      const _renderer = new THREE.WebGLRenderer();
      _renderer.setSize(window?.innerWidth, window?.innerHeight);
      bodyRef?.current?.appendChild(_renderer.domElement);

      //render cube
      const geometry = new THREE.BoxGeometry(1, 1, 1);
      const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
      const _cube = new THREE.Mesh(geometry, material);
      _scene.add(_cube);
      _camera.position.z = 5;
      _renderer.render(_scene, _camera);
      setScene(_scene);
      setCamera(_camera);
      setRenderer(_renderer);
      setCube(_cube);
    }
  };

  useEffect(() => {
    renderThreeJs();
  }, []);

  const animateCube = () => {
    if (cube) {
      cube.rotation.x += 0.01;
      cube.rotation.y += 0.01;
    }
  };

  const animate = () => {
    requestAnimationFrame(animate);
    if (renderer && scene && camera) {
      animateCube();
      renderer?.render(scene, camera);
    }
  };

  animate();

  return <div ref={bodyRef} />;
};

export default LearnThreeJs;
