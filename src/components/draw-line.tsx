import { useEffect, useRef, useState } from "react";
import * as THREE from "three";

const DrawLine = () => {
  const bodyRef = useRef<any>();
  const [scene, setScene] = useState<THREE.Scene | undefined>();
  const [camera, setCamera] = useState<THREE.Camera | undefined>();
  const [renderer, setRenderer] = useState<THREE.WebGLRenderer | undefined>();
  const [line, setLine] = useState<THREE.Line | undefined>();

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
      _camera?.position.set(0, 0, 100);
      _camera?.lookAt(0, 0, 0);
      const _renderer = new THREE.WebGLRenderer();
      _renderer.setSize(window?.innerWidth, window?.innerHeight);
      bodyRef?.current?.appendChild(_renderer.domElement);

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
      _renderer.render(_scene, _camera);

      setScene(_scene);
      setCamera(_camera);
      setRenderer(_renderer);
      setLine(_line);
    }
  };

  useEffect(() => {
    renderThreeJs();
  }, []);

  const animateLine = () => {
    if (line) {
      line.rotation.x += 0.01;
      line.rotation.y += 0.01;
    }
  };

    const animate = () => {
      requestAnimationFrame(animate);
      if (renderer && scene && camera) {
        animateLine()
        renderer?.render(scene, camera);
      }
    };

    animate();

  return <div ref={bodyRef} />;
};

export default DrawLine;
