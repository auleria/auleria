import {Remote} from "./Remote";
import {Helper} from "./Helper";

export abstract class GameObject
{
	@Remote.once
	@Remote.master
	private _id : string;

	public get id() { return this._id; }

	@Remote.master
	public transform : ITransform;

	constructor()
	{
		this._id = Helper.generateID();
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

