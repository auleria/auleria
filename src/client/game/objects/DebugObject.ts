import { GameObject } from "../GameObject";
import { ByteBuffer } from "../../ByteBuffer";
import { Classes } from "../../Classes";
import { Tween } from "../../Tween";
import { DebugWorld } from "../worlds/DebugWorld";

@Classes.register
export class DebugObject extends GameObject
{
	public playerID : string;
	private changedName = false;
	private text : HTMLDivElement;

	private x = 0;
	private y = 0;

	private boxMesh : THREE.Mesh;

	constructor(name : string = "Hankerino")
	{
		super();
		this.playerID = name;
	}

	public initialize(): void {

		if (this.isMaster)
		{
			console.log("created debug object with name", this.playerID);
			this.x = Math.random() * Math.PI * 2;
			this.y = Math.random() * Math.PI * 2;
		}
		else
		{
			Tween.simple(this, "x");

			let geometry = new THREE.BoxGeometry(1, 1, 1);
			this.boxMesh = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({color: 0xffffff}));

			this.boxMesh.position.y = this.y;
			this.world.scene.add(this.boxMesh);
		}

		let dworld = this.world as DebugWorld;
		dworld.players.set(this.playerID, this);
	}

	public writeToBuffer(buffer : ByteBuffer, forced : boolean)
	{
		if (this.isMaster)
		{
			if (forced) {
				buffer.writeFloat(this.y);
			}
			buffer.writeFloat(Math.sin(this.x));
			return true;
		}
	}

	public readFromBuffer(buffer : ByteBuffer, forced : boolean = false)
	{
		if (!this.isMaster)
		{
			if (forced) {
				this.y = buffer.readFloat();
			}
			this.x = buffer.readFloat();
		}
	}

	public tick(timescale : number): void {
		this.x += Math.PI * timescale;
	}

	public update(): void {
		this.boxMesh.position.x = this.x;
	}

	public onDestroy(): void {
		if (!this.isMaster)
		{
			this.world.scene.remove(this.boxMesh);
		}
	}
}
