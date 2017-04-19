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
	private _isOwner : boolean;
	private _owner : string;
	private _me : string;
	public get isMaster() { return this._isMaster; }
	public get isOwner() { return this._isOwner; }
	public get id() { return this._id; }
	public get owner() { return this._owner; }
	public get me() { return this._me; }

	constructor(id? : string, owner : string = "", isOwner : boolean = true, isMaster : boolean = true, me : string = "noname")
	{
		this._id = id || Helper.generateID();
		this._isMaster = isMaster;
		this._isOwner = isOwner;
		this._owner = owner;
		this._me = me;
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

	public update()
	{
		for (let kvp of this.gameObjects)
		{
			let object = kvp[1];
			object.update();
		}
	}

	public postUpdate()
	{
		for (let kvp of this.gameObjects)
		{
			let object = kvp[1];
			object.postUpdate();
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
			this.writeObjectData(object, true);
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

	public getBuffer()
	{
		return this.byteBuffer;
	}

	public writeToBuffer()
	{
		this.writeUpdateData();
	}

	public writeCreationData(buffer : ByteBuffer)
	{
		this.gameObjects.forEach((object, id) => {
			buffer.writeByte(NetworkCode.CREATE_OBJECT);
			this.byteBuffer.writeString(object.constructor.name);
			this.byteBuffer.writeId(object.id);
			this.writeObjectData(object, true);
			this.byteBuffer.writeByte(NetworkCode.OBJECT_INITIALIZATION);
			this.byteBuffer.writeId(object.id);
		});
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
		let forced = buffer.readByte() === 1 ? true : false;
		let object = this.gameObjects.get(id);
		object.readFromBuffer(buffer, forced);
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
			this.writeObjectData(object, false);
		}
	}

	private writeObjectData(object : GameObject, forced : boolean)
	{
		let prevPos = this.byteBuffer.position;
		this.byteBuffer.seek(prevPos + 1 + Helper.ID_SIZE + 1);
		if ( object.writeToBuffer(this.byteBuffer, forced) )
		{
			let curPos = this.byteBuffer.position;
			this.byteBuffer.seek(prevPos);
			this.byteBuffer.writeByte(NetworkCode.OBJECT_DATA);
			this.byteBuffer.writeId(object.id);
			this.byteBuffer.writeByte(forced ? 1 : 0);
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
		let object = new type() as GameObject;
		object.preInitialize(this, id);
		this.gameObjects.set(id, object);
	}
}

