import { useEffect, useRef, useState } from "react";
import {
  Scene,
  WebGLRenderer,
  PerspectiveCamera,
  BoxGeometry,
  ShaderMaterial,
  Color,
  Vector2,
  Vector3,
  Raycaster,
  Object3D,
  MathUtils,
  LoadingManager,
} from "three";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { MeshSurfaceSampler } from "three/examples/jsm/math/MeshSurfaceSampler.js";
import { InstancedUniformsMesh } from "three-instanced-uniforms-mesh";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import TWEEN from "@tweenjs/tween.js";
import { gsap } from "gsap";
const brainGlb = require("../model/brain.glb");
const brainFragment = require("../model/brain.fragment.glsl");
const brainVertex = require("../model/brain.vertex.glsl");

const Dala = () => {
  const bodyRef = useRef<any>();
  const [scene, setScene] = useState<Scene>();
  const [camera, setCamera] = useState<PerspectiveCamera>();
  const [renderer, setRenderer] = useState<WebGLRenderer>();
  const [controls, setControls] = useState<OrbitControls>();
  const [loadingManager, setLoadingManager] = useState<LoadingManager>();
  const [gltfLoader, setGltfLoader] = useState<GLTFLoader>();
  const [mouse, setMouse] = useState<Vector2>();
  //   const [raycaster, setRaycaster] = useState<Raycaster>();
  const [point, setPoint] = useState<Vector3>();
  //   const [brain, setBrain] = useState<any>();
  const uniforms = {
    uHover: 0,
  };
  let hover = false;
  let intersects: string | any[] = [];
  const instObj: Object3D<THREE.Object3DEventMap>[] = [];
  const instStart: Vector3[] = [];
  const instFinish: Vector3[] = [];
  const colors = [
    new Color(0x963cbd),
    new Color(0xff6f61),
    new Color(0xc5299b),
    new Color(0xfeae51),
  ];
  let instancedMesh: InstancedUniformsMesh<ShaderMaterial>;
  const raycaster = new Raycaster();
  let brain: any;

  const _animateHoverUniform = (value: number) => {
    if (instancedMesh) {
      gsap.to(uniforms, {
        uHover: value,
        duration: 0.25,
        onUpdate: () => {
          for (let i = 0; i < instancedMesh.count; i++) {
            instancedMesh.setUniformAt("uHover", i, uniforms.uHover);
          }
        },
      });
    }
  };

  const _onMousemove = (e: { clientX: number; clientY: number }) => {
    if (mouse && camera && raycaster && point && instancedMesh) {
      const x = (e.clientX / bodyRef?.current.offsetWidth) * 2 - 1;
      const y = -((e.clientY / bodyRef?.current.offsetHeight) * 2 - 1);

      mouse.set(x, y);

      gsap.to(camera.position, {
        x: () => x * 0.15,
        y: () => y * 0.1,
        duration: 0.5,
      });
      raycaster.setFromCamera(mouse, camera);
      //   console.log(intersects, raycaster, brain);
      //   const a = raycaster.intersectObject(brain);
      //   console.log(a);
      if (brain) {
        intersects = raycaster.intersectObject(brain);
        if (intersects.length === 0) {
          if (hover) {
            hover = false;
            _animateHoverUniform(0);
          }
        } else {
          if (!hover) {
            hover = true;
            _animateHoverUniform(1);
          }
          gsap.to(point, {
            x: () => intersects[0]?.point.x || 0,
            y: () => intersects[0]?.point.y || 0,
            z: () => intersects[0]?.point.z || 0,
            overwrite: true,
            duration: 0.3,
            onUpdate: () => {
              for (let i = 0; i < instancedMesh.count; i++) {
                instancedMesh.setUniformAt("uPointer", i, point);
              }
            },
          });
        }
      }
    }
  };

  const _mousemoveCb = (e: any) => _onMousemove(e);

  const _createRenderer = () => {
    const _scene = new Scene();
    const _camera = new PerspectiveCamera(
      75,
      bodyRef?.current?.clientWidth / bodyRef?.current.clientHeight,
      0.1,
      100
    );
    _camera.position.set(0, 0, 1.2);
    const _renderer = new WebGLRenderer({
      alpha: true,
      antialias: window.devicePixelRatio === 1,
    });

    bodyRef?.current?.appendChild(_renderer.domElement);

    const light = new THREE.AmbientLight(0xffffff);
    _scene.add(light);
    _renderer.setSize(
      bodyRef?.current?.clientWidth,
      bodyRef?.current?.clientHeight
    );
    _renderer.setPixelRatio(Math.min(1.5, window.devicePixelRatio));
    // _renderer.physicallyCorrectLights = true

    const _controls = new OrbitControls(_camera, _renderer.domElement);
    setControls(_controls);
    setScene(_scene);
    setCamera(_camera);
    setRenderer(_renderer);
  };

  const _createRaycaster = () => {
    const _mouse = new Vector2();
    const _point = new Vector3();
    setMouse(_mouse);
    // setRaycaster(_raycaster);
    setPoint(_point);
  };

  const _createLoader = () => {
    const _loadingManager = new LoadingManager();
    _loadingManager.onLoad = () => {
      document.documentElement.classList.add("model-loaded");
    };
    const _gltfLoader = new GLTFLoader(_loadingManager);
    setGltfLoader(_gltfLoader);
  };

  const loadModel = () => {
    return new Promise<void>((resolve) => {
      gltfLoader &&
        gltfLoader.load(brainGlb, (gltf) => {
          brain = gltf.scene.children[0];
          let _sampler = new MeshSurfaceSampler(brain).build();

          let box = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.8, 0.8));
          let samplerBox = new MeshSurfaceSampler(box).build();

          const geometry = new BoxGeometry(0.004, 0.004, 0.004, 1, 1, 1);

          const material = new ShaderMaterial({
            vertexShader: require("../model/brain.vertex.glsl"),
            fragmentShader: require("../model/brain.fragment.glsl"),
            wireframe: true,
            uniforms: {
              uPointer: { value: new Vector3() },
              uColor: { value: new Color() },
              uRotation: { value: 0 },
              uSize: { value: 0 },
              uHover: { value: uniforms.uHover },
            },
          });

          instancedMesh = new InstancedUniformsMesh(
            geometry,
            material,
            brain.geometry.attributes.position.count
          );
          scene && scene.add(instancedMesh);
          const dummy = new Object3D();
          const positions = brain.geometry.attributes.position.array;
          for (let i = 0; i < positions.length; i += 3) {
            dummy.position.set(
              positions[i + 0],
              positions[i + 1],
              positions[i + 2]
            );

            let v = new THREE.Vector3(
              positions[i + 0],
              positions[i + 1],
              positions[i + 2]
            );

            dummy.updateMatrix();

            instancedMesh.setMatrixAt(i / 3, dummy.matrix);

            instancedMesh.setUniformAt(
              "uRotation",
              i / 3,
              MathUtils.randFloat(-1, 1)
            );

            instancedMesh.setUniformAt(
              "uSize",
              i / 3,
              MathUtils.randFloat(0.3, 3)
            );

            const colorIndex = MathUtils.randInt(0, colors.length - 1);
            instancedMesh.setUniformAt("uColor", i / 3, colors[colorIndex]);

            instObj.push(dummy.clone());
            instStart.push(v.clone());

            samplerBox.sample(v);
            instFinish.push(v.clone());
          }

          new TWEEN.Tween({ val: 0 })
            .to({ val: 1 }, 2000)
            .delay(2000)
            .repeat(Infinity)
            .yoyo(true)
            .onUpdate((val) => {
              instObj.forEach((o, idx) => {
                o.position.lerpVectors(
                  instStart[idx],
                  instFinish[idx],
                  val.val
                );
                o.updateMatrix();
                instancedMesh.setMatrixAt(idx, o.matrix);
              });
              instancedMesh.instanceMatrix.needsUpdate = true;
            })
            .start();
          resolve();
        });
    });
  };

  const init = () => {
    if (bodyRef && !bodyRef?.current?.children?.length) {
      _createRenderer();
      _createRaycaster();
      _createLoader();
    }
  };

  useEffect(() => {
    try {
      init();
    } catch (e) {
      console.log("error init: ", e);
    }
  }, []);

  const _addListeners = () => {
    window.addEventListener("mousemove", _mousemoveCb, { passive: true });
  };

  const _update = () => {
    if (camera) {
      camera.lookAt(0, 0, 0);
      camera.position.z = 1.2;
    }
  };

  const loadModelInit = () => {
    loadModel().then(() => {
      _addListeners();
      let clock = new THREE.Clock();
      //   console.log("renderer: ", renderer);
      //   console.log("instancedMesh: ", instancedMesh);
      //   console.log("scene: ", scene);
      //   console.log("camera: ", camera);
      if (renderer && instancedMesh && scene && camera) {
        renderer.setAnimationLoop(() => {
          _update();

          let t = clock.getDelta() * 2;
          controls && controls.update();
          TWEEN.update();
          instObj.forEach((o, idx) => {
            o.rotation.x += t;
            o.rotation.y += t;
            o.updateMatrix();
            instancedMesh.setMatrixAt(idx, o.matrix);
          });
          if (instancedMesh) instancedMesh.instanceMatrix.needsUpdate = true;
          renderer.render(scene, camera);
        });
      }
    });
  };

  useEffect(() => {
    if (renderer) {
      try {
        loadModelInit();
      } catch (e) {
        console.log("load model init: ", e);
      }
    }
  }, [renderer]);

  return <div ref={bodyRef} style={{ width: "100vw", height: "100vh" }} />;
};

export default Dala;
