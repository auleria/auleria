import { GameObject } from "./GameObject";
import { Helper } from "../Helper";
import { ByteBuffer } from "../ByteBuffer";
import { NetworkCode } from "../NetworkCode";
import { Classes } from "../Classes";

const FOV = 90;

export abstract class GameWorld
{
	private _id : string;
	private _isMaster : boolean;
	private _isOwner : boolean;
	private _owner : string;
	private _me : string;

	public get isMaster() { return this._isMaster; }
	public get isOwner() { return this.owner === this.me; }
	public get id() { return this._id; }
	public get owner() { return this._owner; }
	public get me() { return this._me; }
	public get scene() { return this._scene; }
	public isInitialized : boolean;

	protected byteBuffer  = new ByteBuffer();

	private gameObjects = new Map<string, GameObject>();
	private _scene : THREE.Scene;
	protected mainCamera : THREE.PerspectiveCamera;
	private renderer : THREE.Renderer;

	private eventListeners = new Map<string, Function>();

	constructor(id? : string, owner : string = "", isOwner : boolean = true, isMaster : boolean = true, me : string = "noname")
	{
		this._id = id || Helper.generateID();
		this._isMaster = isMaster;
		this._isOwner = isOwner;
		this._owner = owner;
		this._me = me;

		if (!isMaster)
		{
			this._scene = new THREE.Scene();
			this.mainCamera = new THREE.PerspectiveCamera(FOV, 1, 0.1, 1000);
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
	}

	public initialize() : void { }
	public masterInitialize() : void { }
	public clientInitialize() : void { }

	public tick(timescale : number)
	{
		for (let kvp of this.gameObjects)
		{
			let object = kvp[1];
			object.tick(timescale);
		}
	}

	public update(timescale : number)
	{
		for (let kvp of this.gameObjects)
		{
			let object = kvp[1];
			object.update(timescale);
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

	public render()
	{
		if (this.renderer && this.scene && this.mainCamera)
		{
			if ((this.renderer as any).needsUpdate)
			{
				(this.renderer as any).needsUpdate = false;
				this.setAspect(window.innerWidth / window.innerHeight);
			}
			this.renderer.render(this.scene, this.mainCamera);
		}
	}

	public setRenderer(renderer : THREE.Renderer)
	{
		this.renderer = renderer;
	}

	public setAspect(aspect : number)
	{
		this.mainCamera.aspect = aspect;
		this.mainCamera.updateProjectionMatrix();
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

	public add<T extends GameObject>(object : T) : T
	{
		object.preInitialize(this);
		this.gameObjects.set(object.id, object);

		if (this.isMaster)
		{
			this.byteBuffer.writeByte(NetworkCode.CREATE_OBJECT);
			this.byteBuffer.writeString(object.constructor.name);
			this.byteBuffer.writeId(object.id);
			this.byteBuffer.writeString(object.owner);
			this.writeObjectData(object, true);
			object.externalInitialize();
			this.writeObjectData(object, true);
			this.byteBuffer.writeByte(NetworkCode.OBJECT_INITIALIZATION);
			this.byteBuffer.writeId(object.id);
		}
		else
		{
			object.externalInitialize();
		}

		return object;
	}

	public destroy(object : GameObject)
	{
		if (!object) { return; }

		this.gameObjects.delete(object.id);
		if (this.isMaster)
		{
			this.byteBuffer.writeByte(NetworkCode.DESTROY_OBJECT);
			this.byteBuffer.writeId(object.id);
			object.onDestroy();
		}
		else
		{
			object.onDestroy();
		}
	}

	public writeCreationData()
	{
		this.gameObjects.forEach((object, id) => {
			this.byteBuffer.writeByte(NetworkCode.CREATE_OBJECT);
			this.byteBuffer.writeString(object.constructor.name);
			this.byteBuffer.writeId(object.id);
			this.byteBuffer.writeString(object.owner);
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
				case NetworkCode.DESTROY_OBJECT:
					this.destroyObjectFromBuffer(buffer);
					break;
				case NetworkCode.OBJECT_DATA:
					this.readObjectData(buffer);
					break;
				case NetworkCode.OBJECT_INITIALIZATION:
					this.initializeObjectFromBuffer(buffer);
					break;
				case NetworkCode.OBJECT_TRANSFER_OWNERSHIP:
					this.setOwner(buffer);
					break;
				case NetworkCode.WORLD_EVENT:
					this.handleEvent(buffer);
					break;
				default:
					buffer.seek(buffer.position - 1);
					abort = true;
					console.log("unknown event id", eventid, this.isMaster);
			}
		}
	}

	private setOwner(buffer : ByteBuffer)
	{
		let id = buffer.readId();
		let newOwner = buffer.readString();

		let object = this.gameObjects.get(id);
		if (object)
		{
			object.setOwner(newOwner);
		}
	}

	public transferOwner(object : GameObject, newOwner : string)
	{
		object.setOwner(newOwner);
		this.byteBuffer.writeByte(NetworkCode.OBJECT_TRANSFER_OWNERSHIP);
		this.byteBuffer.writeId(object.id);
		this.byteBuffer.writeString(newOwner);
	}

	private readObjectData(buffer : ByteBuffer)
	{
		let id = buffer.readId();
		let size = buffer.readInt32();
		let forced = buffer.readByte() === 1 ? true : false;
		let object = this.gameObjects.get(id);
		if (object)
		{
			object.readFromBuffer(buffer, forced);
		}
		else
		{
			console.log("unknown object id", id, "is master", this.isMaster);
			buffer.moveForward(size);
		}
	}

	private initializeObjectFromBuffer(buffer : ByteBuffer)
	{
		let id = buffer.readId();
		let gameObject = this.gameObjects.get(id);
		if (gameObject && !gameObject.isInitialized)
		{
			this.gameObjects.get(id).externalInitialize();
		}
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
		let objectstart = prevPos + 1 + Helper.ID_SIZE + 1 + 4;
		this.byteBuffer.seek(objectstart);
		if ( object.writeToBuffer(this.byteBuffer, forced) )
		{
			let curPos = this.byteBuffer.position;
			let size = curPos - objectstart;
			this.byteBuffer.seek(prevPos);
			this.byteBuffer.writeByte(NetworkCode.OBJECT_DATA);
			this.byteBuffer.writeId(object.id);
			this.byteBuffer.writeInt32(size);
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
		let owner = buffer.readString();
		let type = Classes.getClass(typename);
		let object = this.gameObjects.get(id);
		if (object)
		{
			console.warn("Trying to create existing object, updating instead");
		}
		else
		{
			object = new type();
			object.setOwner(owner);
			object.preInitialize(this, id);
			this.gameObjects.set(id, object);
		}

	}

	private destroyObjectFromBuffer(buffer : ByteBuffer)
	{
		let id = buffer.readId();
		this.destroy(this.gameObjects.get(id));
	}

	public event(name : string, message : object = {})
	{
		this.byteBuffer.writeByte(NetworkCode.WORLD_EVENT);
		this.byteBuffer.writeString(name);
		this.byteBuffer.writeString(this.me);
		this.byteBuffer.writeString(JSON.stringify(message));
	}

	private handleEvent(buffer : ByteBuffer)
	{
		let eventName = buffer.readString();
		let sender = buffer.readString();
		let data = JSON.parse(buffer.readString());
		this.triggerEvent(eventName, sender, data);
	}

	public triggerEvent(eventName : string, sender : string, data : object)
	{
		let callback = this.eventListeners.get(eventName);
		if (callback) {
			callback(data, sender);
		}
	}

	public on(name : string, callback : (data : object, sender : string) => void)
	{
		this.eventListeners.set(name, callback);
	}
}

