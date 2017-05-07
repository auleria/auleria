import { GameObject } from "../GameObject";
import { Classes } from "../../Classes";

@Classes.register
export abstract class Character extends GameObject
{
	protected mesh : THREE.Mesh;

	protected movementSpeed : number;
	protected running : boolean;

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

	public update(timeScale : number) : void {
	}

	public postUpdate() : void {
		this.mesh.position.copy(this.transform.position);
		this.mesh.rotation.copy(new THREE.Euler().setFromQuaternion(this.transform.rotation));
	}

	public move() : void {

	}
}
