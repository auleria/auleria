import { Helper } from "../Helper";
import { GameWorld } from "./GameWorld";
import { Transform } from "./Transform";
import { ByteBuffer } from "../ByteBuffer";

export abstract class GameObject
{
	private _id = Helper.generateID();
	private _world : GameWorld;
	private _isInitialized : boolean;
	private isDestroyed = false;

	public get id() { return this._id; }
	public get world() { return this._world; }
	public get isMaster() { return this._world.isMaster; }
	public get isOwner() { return this._world.isOwner; }
	public get isInitialized() { return this._isInitialized; }

	@Helper.sealed
	public transform = new Transform();

	public preInitialize(world : GameWorld, id? : string)
	{
		this._id = id || this._id;
		this._world = world;
	}

	public abstract initialize() : void

	public externalInitialize() : void
	{
		this.initialize();
		this._isInitialized = true;
	}

	public tick(timescale?: number) : void { }

	public update() : void { }

	public postUpdate() : void { }

	public abstract onDestroy() : void

	public writeToBuffer(bb : ByteBuffer, forced : boolean = false ) : boolean
	{
		return false;
	}

	public readFromBuffer(bb : ByteBuffer, forced : boolean = false)
	{
		return;
	}
}
