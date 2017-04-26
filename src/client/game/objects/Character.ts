import { GameObject } from "../GameObject";
import { Classes } from "../../Classes";

@Classes.register
export abstract class Character extends GameObject
{
	protected mesh : THREE.Mesh;

	private movementSpeed : number;
	private running : boolean;

	constructor()
	{
		super();
	}

	public initialize() : void {

	}

	public masterInitialize() : void {

	}

	public clientInitialize() : void {

	}

	public tick(timescale?: number) : void {

	}

	public update() : void {
		this.mesh.position.copy(this.transform.position);
	}

	public move() : void {

	}
}
