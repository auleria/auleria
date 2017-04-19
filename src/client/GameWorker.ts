
import { GameWorld } from "./game/GameWorld";
import { Classes } from "./Classes";
import { ByteBuffer } from "./ByteBuffer";
import { IMessage } from "./IMessage";
import { NetworkCode } from "./NetworkCode";
import { NetworkInterface } from "./NetworkInterface";
import { Helper } from "./Helper";

export class GameWorker
{
	private world : GameWorld;
	private buffer = new ByteBuffer();
	private me : string;
	private interval : NodeJS.Timer;

	public static TICKRATE = 20;
	public static TICKRATE_CHANGED = false;

	private networkInterface : NetworkInterface;

	constructor()
	{
		//Listen to messages from the render thread.
		this.networkInterface = new NetworkInterface(self as any);

		this.networkInterface.on("set me", me => this.me = me);
		this.networkInterface.on("create world", (data, answer) => {
			this.createWorld(Classes.getClass(data.worldType), data.worldId);
			let trimmed = this.buffer.getTrimmedBuffer();
			this.buffer = new ByteBuffer();
			console.log("sending buffer to client");

			this.interval = setInterval(() => this.tick(), 1000 / GameWorker.TICKRATE);

			answer({buffer: trimmed}, [trimmed]);
		});
		this.networkInterface.on("get world data", (data, answer) => {
			let tmpBuffer = this.world.getBuffer();
			let buffer = new ByteBuffer();
			this.world.setBuffer(buffer);
			this.world.writeCreationData(buffer);
			this.world.setBuffer(tmpBuffer);
			let trimmed = buffer.getTrimmedBuffer();
			answer({buffer: trimmed}, [trimmed]);
		});
		this.networkInterface.on("world data", data => {
			this.world.readFromBuffer(new ByteBuffer(data.buffer));
		});
		this.networkInterface.on("get tickrate", (data, answer) => {
			answer(GameWorker.TICKRATE);
		});
		this.networkInterface.on("set tickrate", tickrate => {
			GameWorker.TICKRATE = tickrate;
			clearInterval(this.interval);
			this.interval = setInterval(() => this.tick(), 1000 / GameWorker.TICKRATE);
		});
	}

	private handleMessage(event:MessageEvent)
	{
		let message = event.data;
		switch (message.messagetype)
		{
			case "setme":
				this.me = message.me;
				console.log(this.me);
				break;
			case "createWorld":
				console.log("About to create a new world of type", message.data.worldType);
				this.createWorld(Classes.getClass(message.data.worldType), message.worldId);
				break;
			case "worlddata":
				this.world.readFromBuffer(new ByteBuffer(message.buffer));
				break;
			case "fullsync":
				let tmpBuffer = this.world.getBuffer();
				let buffer = new ByteBuffer();
				this.world.setBuffer(buffer);
				this.world.writeCreationData(buffer);
				this.world.setBuffer(tmpBuffer);
				let trimmed = buffer.getTrimmedBuffer();
				break;
			default:
			console.warn("Got unknown event", message);
		}
	}

	private createWorld(worldType : any, id : string)
	{
		let world = new worldType(id, this.me, true, true, this.me) as GameWorld;
		this.world = world;
		world.setBuffer(this.buffer);
		world.initialize();
	}

	private tick()
	{
		if (this.world)
		{
			this.world.setBuffer(this.buffer);
			this.world.tick(1 / GameWorker.TICKRATE);
			this.world.writeToBuffer();
			this.sendBuffer();
		}
	}

	private sendBuffer()
	{
		let trimmed = this.buffer.getTrimmedBuffer();
		this.networkInterface.post("world data", {buffer: trimmed, id: this.world.id}, [trimmed]);
		this.buffer = new ByteBuffer();
	}
}
