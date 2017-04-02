import { Remote, IPropertyPair } from "./Remote";
import { Helper } from "./Helper";
import { GameWorld } from "./game/GameWorld";
import { Transform } from "./game/Transform";
import { ByteBuffer } from "./ByteBuffer";

export abstract class GameObject
{
	private _id = Helper.generateID();
	private _world : GameWorld;

	public get id() { return this._id; }
	public get world() { return this._world; }
	public get isMaster() { return this._world.isMaster; }

	@Helper.sealed
	public transform = new Transform();

	public preInitialize(world : GameWorld, id? : string)
	{
		this._id = id || this._id;
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

	public readFromBuffer(bb : ByteBuffer)
	{
		return;
	}
}

export interface IGameObjectData
{
	id : string;
	type : string;
	properties : IPropertyPair[];
}
