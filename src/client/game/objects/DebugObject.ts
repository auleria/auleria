import { GameObject } from "../GameObject";
import { ByteBuffer } from "../../ByteBuffer";
import { Classes } from "../../Classes";
import { Tween } from "../../Tween";
import { DebugWorld } from "../worlds/DebugWorld";
import { Input } from "../../Input";

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
			//Tween.simple(this, "x");

			let geometry = new THREE.BoxGeometry(1, 1, 1);
			this.boxMesh = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({color: 0xffffff}));

			this.boxMesh.position.y = this.y;
			this.world.scene.add(this.boxMesh);
		}
	}

	public writeToBuffer(buffer : ByteBuffer, forced : boolean)
	{
		if (this.isMaster || this.isOwner)
		{
			buffer.writeFloat(this.y);
			buffer.writeFloat(this.x);
			return true;
		}
	}

	public readFromBuffer(buffer : ByteBuffer, forced : boolean)
	{
		if (this.isMaster || !this.isOwner)
		{
			this.y = buffer.readFloat();
			this.x = buffer.readFloat();
			return;
		}

		if (this.isOwner)
		{
			buffer.readFloat();
			buffer.readFloat();
		}
	}

	public tick(timescale : number): void {
		
	}

	public update(): void {
		if (this.isOwner)
		{
			if (Input.keys.StrafeLeft)
			{
				this.x--;
			}
			if (Input.keys.StrafeRight)
			{
				this.x++;
			}
			if (Input.keys.Forward)
			{
				this.y++;
			}
			if (Input.keys.Backward)
			{
				this.y--;
			}
		}
		this.boxMesh.position.x = this.x;
		this.boxMesh.position.y = this.y;
	}

	public onDestroy(): void {
		if (!this.isMaster)
		{
			this.world.scene.remove(this.boxMesh);
		}
	}
}
