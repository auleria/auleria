import { Remote, IPropertyPair } from "./Remote";
import { Helper } from "./Helper";
import { GameWorld } from "./game/GameWorld";
import { Transform } from "./game/Transform";

export abstract class GameObject
{
	@Remote.monitor(Remote.DIRECTION.MASTER_TO_SLAVE)
	private _id = Helper.generateID();

	public get id() { return this._id; }

	private _world : GameWorld;
	public get world() { return this._world; }

	@Remote.monitor(Remote.DIRECTION.MASTER_TO_SLAVE)
	@Helper.sealed
	public transform = new Transform();

	public preInitialize(world : GameWorld)
	{
		this._world = world;
	}

	public abstract initialize() : void

	public abstract masterUpdate() : void

	public abstract slaveUpdate() : void

	public abstract destroy() : void
}

export interface IGameObjectData
{
	id : string;
	type : string;
	properties : IPropertyPair[];
}
