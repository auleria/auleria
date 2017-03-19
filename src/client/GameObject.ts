import {Remote} from "./Remote";

export class GameObject
{
	private id : string;

	@Remote.master
	private transform : ITransform;
	@Remote.bi
	private name : string;

	constructor(name : string)
	{
		this.name = name;
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

