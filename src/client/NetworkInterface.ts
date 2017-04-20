
import { Helper } from "./Helper";
import { NetworkHub } from "./NetworkHub";

enum RESPONSE_CODE {OK, ERROR, NOTFOUND}

export class NetworkInterface
{
	private inTransit = new Map<string, any>();
	private handlers = new Map<string, (data : any, answer : (data : any) => void) => void>();
	private hubs = new Array<NetworkHub>();

	private worker : Worker;
	private connection : any;

	public get peerID() { return this.connection ? this.connection.peer : null; }

	constructor(adapter : any)
	{
		if (adapter.postMessage)
		{
			this.worker = adapter as Worker;
			this.worker.onmessage = (event) => this.handleMessage(event.data);
		}
		else if (typeof adapter.id === "string")
		{
			adapter.on("data", (data : any) => this.handleMessage(data));
			this.connection = adapter;

			adapter.on("close", () => {
				this.handleMessage({__event: "disconnect"});
				this.destroy();
			});
		}
	}

	public destroy()
	{
		this.hubs.forEach(hub => hub.removeInterface(this));
	}

	public post(eventName : string, data? : any, transferable : any[] = new Array())
	{
		if (typeof data !== "object" || data === null)
		{
			data = {__value: data};
		}
		data.__event = eventName;
		this.postMessage(data, transferable);
	}

	public async request(eventName : string, data? : any, transferable : any[] = new Array()) : Promise<any>
	{
		return new Promise((resolve, reject) => {

			if (typeof data !== "object" || data === null)
			{
				data = {__value: data};
			}
			data.__event = eventName;
			data.__id = Helper.generateID();
			this.inTransit.set(data.__id, resolve);
			this.postMessage(data, transferable);
		});
	}

	public on(eventName : string, callback : (data : any, answer : (data : any, transferable? : any[]) => void) => void)
	{
		this.handlers.set(eventName, callback);
	}

	public addHub(hub : NetworkHub)
	{
		this.hubs.push(hub);
	}

	public handleMessage(message : any)
	{
		let messageID = message.__id;
		if (message.__response)
		{
			let resolve = this.inTransit.get(messageID);
			this.inTransit.delete(messageID);
			return resolve(typeof message.__value === "undefined" ? message : message.__value);
		}
		else
		{
			let callback = this.handlers.get(message.__event);
			if (callback)
			{
				callback(message.__value || message, (data : any, transferable? : any[]) => {
					this.answer(message.__id, data, transferable);
				});
			}

			this.hubs.forEach(hub => hub.triggerEvent(this, message));
		}
	}

	private postMessage(data : any, transferable? : any[])
	{
		if (this.worker)
		{
			this.worker.postMessage(data, transferable || []);
		}
		else if (this.connection)
		{
			this.connection.send(data);
		}
	}

	public answer(id : string, data : any, transferable : any[] = [])
	{
		if (typeof data !== "object" || data === null)
		{
			data = {__value: data};
		}
		data.__id = id;
		data.__status = RESPONSE_CODE.OK;
		data.__response = true;
		this.postMessage(data, transferable);
	}
}
