import {Remote} from "./Remote";

export class GameObject
{
	@Remote.once
	@Remote.master
	private id : string;

	@Remote.master
	private transform : ITransform;

	constructor()
	{
		
	}

	initialize()
	{

	}

	masterUpdate()
	{
		this.transform.position.x += 0.1;
	}

	slaveUpdate()
	{
		
	}

	destroy()
	{

	}
}

interface ITransform
{
	rotation : THREE.Quaternion;
	position : THREE.Vector3;
	scale : THREE.Vector3;
}

