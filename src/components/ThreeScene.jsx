import React, { useEffect, useRef } from "react";
import * as THREE from "three";

const ThreeScene = () => {
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const animationFrameRef = useRef(null);

  useEffect(() => {
    let scene;
    let camera;
    let renderer;
    let light;
    let plane;
    let cube;

    const initializeScene = () => {
      scene = new THREE.Scene();
      camera = new THREE.PerspectiveCamera(
        75,
        window.innerWidth / (window.innerHeight * 0.7),
        0.1,
        1000
      );
      renderer = new THREE.WebGLRenderer({ alpha: true });
      renderer.setSize(window.innerWidth, window.innerHeight * 0.7);
      renderer.setClearColor(0x000000, 0);
      const rendererElement = renderer.domElement;
      if (sceneRef.current) {
        sceneRef.current.appendChild(rendererElement);
        rendererRef.current = renderer;
      }

      // 그림자 설정
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;

      // 라이트 추가
      light = new THREE.DirectionalLight(0xffffff, 1);
      light.position.set(0, 2, 2); // 조명의 위치를 변경합니다.
      light.castShadow = true;
      scene.add(light);

      // 평면 추가 (그림자를 받을 평면)
      const planeGeometry = new THREE.PlaneGeometry(10, 10);
      const planeMaterial = new THREE.ShadowMaterial({ opacity: 0.5 });
      plane = new THREE.Mesh(planeGeometry, planeMaterial);
      plane.receiveShadow = true;
      scene.add(plane);

      // 큐브 추가
      const geometry = new THREE.BoxGeometry();
      const material = new THREE.MeshStandardMaterial({ color: "black" });
      cube = new THREE.Mesh(geometry, material);
      cube.castShadow = true;
      scene.add(cube);

      // 카메라 위치 설정
      camera.position.z = 2;
    };

    const animate = () => {
      animationFrameRef.current = requestAnimationFrame(animate);
      cube.rotation.x += 0.01;
      cube.rotation.y += 0.01;
      renderer.render(scene, camera);
    };

    const cleanupScene = () => {
      cancelAnimationFrame(animationFrameRef.current);
      if (rendererRef.current) {
        rendererRef.current.dispose();
      }
      if (scene && cube && light && plane) {
        scene.remove(cube);
        scene.remove(light);
        scene.remove(plane);
      }
      if (sceneRef.current) {
        sceneRef.current.innerHTML = "";
      }
    };

    initializeScene();
    animate();

    return cleanupScene;
  }, []);

  return <div ref={sceneRef} />;
};

export default ThreeScene;
