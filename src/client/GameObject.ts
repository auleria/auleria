import { Remote, IPropertyPair } from "./Remote";
import { Helper } from "./Helper";
import { GameWorld } from "./game/GameWorld";
import { Transform } from "./game/Transform";
import { ByteBuffer } from "./ByteBuffer";

export abstract class GameObject
{
	private _id = Helper.generateID();

	public get id() { return this._id; }

	private _world : GameWorld;
	public get world() { return this._world; }

	@Helper.sealed
	public transform = new Transform();

	public preInitialize(world : GameWorld)
	{
		this._world = world;
	}

	public abstract initialize() : void

	public abstract tick() : void

	public abstract update() : void

	public abstract destroy() : void

	public writeToBuffer(bb : ByteBuffer)
	{
		return false;
	}
}

export interface IGameObjectData
{
	id : string;
	type : string;
	properties : IPropertyPair[];
}
