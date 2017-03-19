import {Remote} from "./Remote";
import {Helper} from "./Helper";

export abstract class GameObject
{
	@Remote.once
	@Remote.master
	private _id = Helper.generateID();

	public get id() { return this._id; }

	@Remote.master
	@Helper.sealed
	public transform = {rotation: new THREE.Quaternion, position: new THREE.Vector3(), scale: new THREE.Vector3()};

	public preInitialize()
	{

	}

	public abstract initialize() : void

	public abstract masterUpdate() : void

	public abstract slaveUpdate() : void

	public abstract destroy() : void
}

interface ITransform
{
	rotation : THREE.Quaternion;
	position : THREE.Vector3;
	scale : THREE.Vector3;
}

