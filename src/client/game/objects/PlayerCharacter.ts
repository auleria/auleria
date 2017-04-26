import { Character } from "./Character";
import { Classes } from "../../Classes";
import { DebugWorld } from "../worlds/DebugWorld";
import { Tween } from "../../Tween";
import { Input } from "../../Input";

@Classes.register
export class PlayerCharacter extends Character
{
	private camera : THREE.PerspectiveCamera;
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
		this.transform.position = new THREE.Vector3(0,0,30);
	}

	public clientInitialize() : void {
		Tween.simpleRecursive(this.transform.position, /.+/);

		let geometry = new THREE.SphereGeometry(10, 32, 32);
		let material = new THREE.MeshStandardMaterial({color: 0xFFFFFF});
		this.mesh = new THREE.Mesh(geometry, material);

		this.mesh.position.copy(this.transform.position);
		this.world.scene.add(this.mesh);
	}

	public update() : void {
		super.update();

		if(Input.mouse.left)
		{
			this.transform.position.x += 10;
		}
	}

	public onDestroy() : void {
		if (!this.isMaster)
		{
			this.world.scene.remove(this.mesh);
		}
	}
}
