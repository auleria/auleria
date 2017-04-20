
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
			this.world.setBuffer(this.buffer);
			console.log("sending buffer to client");

			answer({buffer: trimmed}, [trimmed]);
			this.interval = setInterval(() => this.tick(), 1000 / GameWorker.TICKRATE);
		});
		this.networkInterface.on("get world data", (data, answer) => {
			let tmpBuffer = this.world.getBuffer();
			let buffer = new ByteBuffer();
			this.world.setBuffer(buffer);
			this.world.writeCreationData();
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
		this.networkInterface.on("join", (user, answer) => {
			this.world.triggerEvent("join", user.id, {});
			answer(true);
		});
		this.networkInterface.on("leave", (user, answer) => {
			this.world.triggerEvent("left", user.id, {});
		});
	}

	private createWorld(worldType : any, id : string)
	{
		let world = new worldType(id, this.me, true, true, this.me) as GameWorld;
		world.setBuffer(this.buffer);
		world.initialize();
		world.triggerEvent("join", this.me, {});
		this.world = world;
	}

	private tick()
	{
		if (this.world)
		{
			this.world.setBuffer(this.buffer);
			this.world.tick(1 / GameWorker.TICKRATE);
			this.world.writeToBuffer();
			this.sendBuffer();
			this.world.setBuffer(this.buffer);
		}
	}

	private sendBuffer()
	{
		let trimmed = this.buffer.getTrimmedBuffer();
		this.networkInterface.post("world data", {buffer: trimmed, id: this.world.id}, [trimmed]);
		this.buffer = new ByteBuffer();
	}
}
