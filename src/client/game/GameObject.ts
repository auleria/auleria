import { Helper } from "../Helper";
import { GameWorld } from "./GameWorld";
import { Transform } from "./Transform";
import { ByteBuffer } from "../ByteBuffer";
import { Classes } from "../Classes";

export abstract class GameObject
{
	private _id = Helper.generateID();
	private _world : GameWorld;
	private _isInitialized : boolean;
	private _forward = new THREE.Vector3(1, 0, 0);
	private isDestroyed = false;
	private _owner : string = null;

	public get id() { return this._id; }
	public get world() { return this._world; }
	public get isMaster() { return this._world.isMaster; }
	public get isOwner() { return this._owner === this.world.me; }
	public get isInitialized() { return this._isInitialized; }
	public get forward() { return this._forward; }
	public get owner() { return this._owner; }

	@Helper.sealed
	public transform = new Transform();

	public static register(target : any)
	{
		Classes.register(target);
	}

	public preInitialize(world : GameWorld, id? : string)
	{
		this._id = id || this._id;
		this._world = world;
		if (this._owner === null)
		{
			this._owner = world.owner;
		}
	}

	public externalInitialize() : void
	{
		this.initialize();
		if (this.isMaster)
		{
			this.masterInitialize();
		}
		else
		{
			this.clientInitialize();
		}
		this._isInitialized = true;
	}

	public setOwner(newOwner : string)
	{
		this._owner = newOwner;
	}

	public initialize() : void { }

	public masterInitialize() : void { }

	public clientInitialize() : void { }

	public tick(timescale?: number) : void { }

	public update(timescale? : number) : void { }

	public postUpdate() : void { }

	public onDestroy() : void { }

	public writeToBuffer(bb : ByteBuffer, fullSync : boolean = false ) : boolean
	{
		return false;
	}

	public readFromBuffer(bb : ByteBuffer, fullSync : boolean = false)
	{
		return;
	}
}
