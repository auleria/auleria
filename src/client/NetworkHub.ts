
import { NetworkInterface } from "./NetworkInterface";

export class NetworkHub
{
	private interfaces = new Array<NetworkInterface>();

	private events = new Map<string, (data : any, sender : NetworkInterface, answer? : (data : any, transferable? : any) => void) => void>();

	public on(event : string, callback : (data : any, sender : NetworkInterface, answer? : (data : any, transferable? : any) => void) => void)
	{
		this.events.set(event, callback);
	}

	public triggerEvent(networkInterface : NetworkInterface, message : any)
	{
		let callback = this.events.get(message.__event);
		if (callback)
		{
			callback(message.__value || message, networkInterface, (data: any, transferable? : any[]) => {
				networkInterface.answer(message.__id, data, transferable);
			});
		}
	}

	public addInterface(networkInterface : NetworkInterface)
	{
		this.interfaces.push(networkInterface);
		networkInterface.addHub(this);
	}

	public removeInterface(networkInterface : NetworkInterface)
	{
		this.interfaces.splice(this.interfaces.findIndex(ni => ni === networkInterface), 1);
	}
}
