import { GameObject, IGameObjectData } from "../GameObject";
import { Helper } from "../Helper";
import { Remote } from "../Remote";
import { ByteBuffer } from "../ByteBuffer";

enum WorldEvent {
	CREATE_OBJECT
};

export abstract class GameWorld
{
	private _id : string;
	private gameObjects = new Map<string, GameObject>();
	private byteBuffer : ByteBuffer;
	private _isMaster : boolean;
	public get isMaster() { return this._isMaster; }
	public get id() { return this._id; }

	constructor(isMaster : boolean)
	{
		this._id = Helper.generateID();
		this.byteBuffer = new ByteBuffer();
		this.byteBuffer.writeId(this._id);
		this._isMaster = isMaster;
	}

	public initialize()
	{
		//TODO: initialize
	}

	public tick()
	{
		for (let kvp of this.gameObjects)
		{
			let object = kvp[1];
			object.tick();
		}
	}

	public add<T extends GameObject>(object : T) : T
	{
		object.preInitialize(this);
		object.initialize();
		this.gameObjects.set(object.id, object);

		if (this.isMaster)
		{
			this.byteBuffer.writeByte(WorldEvent.CREATE_OBJECT);
			this.byteBuffer.writeString(object.constructor.name);
			this.writeObjectData(object);
		}

		return object;
	}

	public setBuffer(buffer : ByteBuffer)
	{
		this.byteBuffer = buffer;
	}

	public writeToBuffer() : ByteBuffer
	{
		this.writeUpdateData();
		return this.byteBuffer;
	}

	private writeUpdateData()
	{
		this.byteBuffer.writeShort(this.gameObjects.size);

		for (let kvp of this.gameObjects)
		{
			let object = kvp[1];
			this.writeObjectData(object);
		}
	}

	private writeObjectData(object : GameObject)
	{
		let prevPos = this.byteBuffer.position;
		this.byteBuffer.seek(prevPos + Helper.ID_SIZE + 4);
		if ( object.writeToBuffer(this.byteBuffer) )
		{
			let curPos = this.byteBuffer.position;
			this.byteBuffer.seek(prevPos);
			this.byteBuffer.writeId(object.id);
			this.byteBuffer.writeInt32(curPos - prevPos - Helper.ID_SIZE - 4);
			this.byteBuffer.seek(curPos);
		}
	}
}

