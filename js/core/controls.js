import * as THREE from 'three';

export class FPSControls {
  constructor(camera, domElement) {
    this.camera = camera;
    this.domElement = domElement;
    this.isLocked = false;
    this._euler = new THREE.Euler(0, 0, 0, 'YXZ');
    this._PI_2 = Math.PI / 2;
    this._onMouseMove = this._onMouseMove.bind(this);
    this._onPointerlockChange = this._onPointerlockChange.bind(this);
    document.addEventListener('pointerlockchange',       this._onPointerlockChange);
    document.addEventListener('mozpointerlockchange',    this._onPointerlockChange);
    document.addEventListener('webkitpointerlockchange', this._onPointerlockChange);
    document.addEventListener('mousemove', this._onMouseMove);
    this._callbacks = { lock: [], unlock: [] };
  }

  addEventListener(event, cb) { if (this._callbacks[event]) this._callbacks[event].push(cb); }
  _emit(event) { (this._callbacks[event] || []).forEach(cb => cb()); }

  _onPointerlockChange() {
    const locked = document.pointerLockElement || document.mozPointerLockElement || document.webkitPointerLockElement;
    if (locked) { this.isLocked = true;  this._emit('lock');   }
    else         { this.isLocked = false; this._emit('unlock'); }
  }

  _onMouseMove(e) {
    if (!this.isLocked) return;
    this._euler.setFromQuaternion(this.camera.quaternion);
    this._euler.y -= (e.movementX || 0) * 0.002;
    this._euler.x -= (e.movementY || 0) * 0.002;
    this._euler.x = Math.max(-this._PI_2, Math.min(this._PI_2, this._euler.x));
    this.camera.quaternion.setFromEuler(this._euler);
  }

  lock() {
    document.body.requestPointerLock = document.body.requestPointerLock ||
      document.body.mozRequestPointerLock || document.body.webkitRequestPointerLock;
    document.body.requestPointerLock();
  }

  unlock() { document.exitPointerLock(); }

  moveForward(distance) {
    const dir = new THREE.Vector3();
    this.camera.getWorldDirection(dir); dir.y = 0; dir.normalize();
    this.camera.position.addScaledVector(dir, distance);
  }

  moveRight(distance) {
    const dir = new THREE.Vector3();
    this.camera.getWorldDirection(dir); dir.y = 0; dir.normalize();
    const right = new THREE.Vector3();
    right.crossVectors(dir, new THREE.Vector3(0,1,0)).normalize();
    this.camera.position.addScaledVector(right, distance);
  }
}