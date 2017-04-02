import { GameObject, IGameObjectData } from "../GameObject";
import { Helper } from "../Helper";
import { Remote } from "../Remote";
import { ByteBuffer } from "../ByteBuffer";
import { NetworkCode } from "../NetworkCode";
import { Classes } from "../Classes";

export abstract class GameWorld
{
	private _id : string;
	private gameObjects = new Map<string, GameObject>();
	private byteBuffer : ByteBuffer;
	private _isMaster : boolean;
	public get isMaster() { return this._isMaster; }
	public get id() { return this._id; }

	constructor(id? : string, isMaster : boolean = true)
	{
		this._id = id || Helper.generateID();
		this._isMaster = isMaster;
	}

	public abstract initialize() : void

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
		this.gameObjects.set(object.id, object);

		if (this.isMaster)
		{
			this.byteBuffer.writeByte(NetworkCode.CREATE_OBJECT);
			this.byteBuffer.writeString(object.constructor.name);
			this.byteBuffer.writeId(object.id);
			this.writeObjectData(object);
			object.initialize();
			this.byteBuffer.writeByte(NetworkCode.OBJECT_INITIALIZATION);
			this.byteBuffer.writeId(object.id);
		}
		else
		{
			object.initialize();
		}

		return object;
	}

	public setBuffer(buffer : ByteBuffer)
	{
		this.byteBuffer = buffer;
	}

	public writeToBuffer()
	{
		this.writeUpdateData();
	}

	public readFromBuffer(buffer : ByteBuffer)
	{
		this.readUpdateData(buffer);
	}

	private readUpdateData(buffer : ByteBuffer)
	{
		let abort = false;
		while (buffer.gotData() && !abort)
		{
			let eventid = buffer.readByte();
			switch (eventid)
			{
				case NetworkCode.CREATE_OBJECT:
					this.createObjectFromBuffer(buffer);
					break;
				case NetworkCode.OBJECT_DATA:
					this.readObjectData(buffer);
					break;
				case NetworkCode.OBJECT_INITIALIZATION:
					this.initializeObjectFromBuffer(buffer);
					break;
				default:
					console.warn("event unhandled:", NetworkCode[eventid]);
					buffer.seek(buffer.position - 1);
					abort = true;
			}
		}
	}

	private readObjectData(buffer : ByteBuffer)
	{
		let id = buffer.readId();
		let object = this.gameObjects.get(id);
		object.readFromBuffer(buffer);
	}

	private initializeObjectFromBuffer(buffer : ByteBuffer)
	{
		let id = buffer.readId();
		this.gameObjects.get(id).initialize();
	}

	private writeUpdateData()
	{
		for (let kvp of this.gameObjects)
		{
			let object = kvp[1];
			this.writeObjectData(object);
		}
	}

	private writeObjectData(object : GameObject)
	{
		let prevPos = this.byteBuffer.position;
		this.byteBuffer.seek(prevPos + 1 + Helper.ID_SIZE);
		if ( object.writeToBuffer(this.byteBuffer) )
		{
			let curPos = this.byteBuffer.position;
			this.byteBuffer.seek(prevPos);
			this.byteBuffer.writeByte(NetworkCode.OBJECT_DATA);
			this.byteBuffer.writeId(object.id);
			this.byteBuffer.seek(curPos);

			return true;
		}
		this.byteBuffer.seek(prevPos);

		return false;
	}

	private createObjectFromBuffer(buffer : ByteBuffer)
	{
		let typename = buffer.readString();
		let id = buffer.readId();
		let type = Classes.getClass(typename);
		let object = new type(this) as GameObject;
		object.preInitialize(this, id);
		this.gameObjects.set(id, object);
	}
}

