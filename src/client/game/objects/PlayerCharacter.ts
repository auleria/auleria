import { Character } from "./Character";
import { Classes } from "../../Classes";
import { DebugWorld } from "../worlds/DebugWorld";
import { Tween } from "../../Tween";
import { Input } from "../../Input";

@Classes.register
export class PlayerCharacter extends Character
{
	public group : THREE.Group;
	public playerID : string;

	constructor(playerid : string)
	{
		super();
		this.playerID = playerid;
	}

	public initialize() : void {
		let dworld = this.world as DebugWorld;
		dworld.players.set(this.id, this);
	}

	public masterInitialize() : void {
		console.log("created player object with id", super.id);
		this.transform.position = new THREE.Vector3(0, 0, 10);
	}

	public clientInitialize() : void {
		Tween.simpleRecursive(this.transform.position, /^(x|y|z)$/);

		this.group = new THREE.Group();
		this.transform.position = new THREE.Vector3(0, 0, 10);

		let geometry = new THREE.BoxGeometry(1, 1, 2);
		let material = new THREE.MeshStandardMaterial({color: 0xFFFFFF});
		this.mesh = new THREE.Mesh(geometry, material);

		this.movementSpeed = 3;

		this.group.position.copy(this.transform.position);
		this.group.add(this.mesh);
		this.world.scene.add(this.group);
	}

	public update(timeScale : number) : void {
		super.update(timeScale);

		if(this.isOwner) {
			if(Input.keys.StrafeLeft || Input.keys.StrafeRight)
			{
				let euler = new THREE.Euler().setFromQuaternion(this.transform.rotation);
				euler.z += (Input.keys.StrafeRight) ? -0.15 * timeScale : 0.15 * timeScale;
				this.transform.rotation.setFromEuler(euler);
			}

			if(Input.keys.Forward || Input.keys.Backward)
			{
				let velocity = new THREE.Vector3().copy(this.forward);
				velocity.applyQuaternion(this.transform.rotation);
				velocity.normalize();

				velocity.multiplyScalar((Input.keys.Forward) ? this.movementSpeed * timeScale : -this.movementSpeed * timeScale);

				this.transform.position.add(velocity);
			}
		}
	}

	public postUpdate () {
		super.postUpdate();
		(this.world as DebugWorld).terrain.poi = this.transform.position;
	}

	public onDestroy() : void {
		if (!this.isMaster)
		{
			this.world.scene.remove(this.mesh);
		}
	}
}